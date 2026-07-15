package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.TeamResultResponse;
import com.minhtung.hackathon.dto.response.TeamRoundResultDTO;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.RankingScope;
import com.minhtung.hackathon.enums.SubmissionStatus;
import com.minhtung.hackathon.enums.TeamResultStatus;
import com.minhtung.hackathon.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;


@Service
    @RequiredArgsConstructor
    public class TeamResultService {

        private final TeamResultRepository teamResultRepository;
        private final TrackRepository trackRepository;
        private final RoundRepository roundRepository;
        private final EventRepository eventRepository;
        private final UserRepository userRepository;
        private final TeamRepository teamRepository;
        private final MemberRepository memberRepository;
    private final EventService eventService;

    @Transactional
        public List<TeamResultResponse> getTrackRanking(Long trackId, Long roundId) {
            if (!trackRepository.existsById(trackId)) {
                throw new RuntimeException("khong tim thay track");
            }

            Round round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new RuntimeException("khong tim thay round"));
            Track track = trackRepository.findById(trackId)
                    .orElseThrow(() -> new RuntimeException("khong tim thay track"));

            if (track.getEvent().getId()
                    != round.getEvent().getId()) {
                throw new RuntimeException(
                        "Track và Round không cùng Event"
                );
            }

            List<TeamResult> results =
                    teamResultRepository.findByTeamTrackIdAndRoundIdOrderByTotalScoreDesc(trackId, roundId);

            return mapAndRecalculateRanking(results);
        }

        @Transactional
        public List<TeamResultResponse>getRoundRanking(
                Long roundId
        ){
            if(!roundRepository.existsById(roundId)){
                throw  new RuntimeException("khong tim thay round");
            }
            List<TeamResult>results = teamResultRepository.findByRoundIdOrderByTotalScoreDesc(roundId);
            return mapAndRecalculateRanking(results);
        }
        @Transactional
        public List<TeamResultResponse> getEventRanking(
                Long eventId
        ){
            if(!eventRepository.existsById(eventId)){
                throw new RuntimeException("khong tim thay event");
            }
            List<EventRankingProjection>result = teamResultRepository.findEventRanking(eventId);

            AtomicInteger ranking = new AtomicInteger(1);
            return result.stream()
                    .map(item ->
                            mapEventProjection(
                                    item,
                                    ranking.getAndIncrement()
                            )
                    )
                    .toList();
        }

        @Transactional
        public void publishTrackResults(Long trackId , Long roundId){
        if(!trackRepository.existsById(trackId)){
            throw new RuntimeException("khong tim thay track") ;
        }
        if(!roundRepository.existsById(roundId)){
            throw new RuntimeException("khong tim thay round") ;
        }
        int updated = teamResultRepository.publishTrackResults(trackId,roundId, TeamResultStatus.PUBLISHED);

        if(updated == 0 ){
            throw  new RuntimeException("khong co ket qua nao de cong bo ");
        }

        }
    @Transactional
    public List<TeamResultResponse> getPublicRanking(
            RankingScope scope,
            Long id,
            Long roundId
    ) {
        return switch (scope) {
            case TRACK -> {
                if (roundId == null) {
                    throw new RuntimeException(
                            "roundId là bắt buộc khi xem Track"
                    );
                }

                List<TeamResult> results =
                        teamResultRepository
                                .findByTeamTrackIdAndRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        roundId,
                                        TeamResultStatus.PUBLISHED
                                );

                yield mapAndRecalculateRanking(results);
            }

            case ROUND -> {
                List<TeamResult> results =
                        teamResultRepository
                                .findByRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        TeamResultStatus.PUBLISHED
                                );

                yield mapAndRecalculateRanking(results);
            }

            case EVENT -> {
                List<EventRankingProjection> results =
                        teamResultRepository
                                .findPublishedEventRanking(
                                        id,
                                        TeamResultStatus.PUBLISHED
                                );

                AtomicInteger ranking =
                        new AtomicInteger(1);

                yield results.stream()
                        .map(item ->
                                mapEventProjection(
                                        item,
                                        ranking.getAndIncrement()
                                )
                        )
                        .toList();
            }
        };
    }

        private TeamResultResponse mapToResponse(TeamResult result, int ranking) {
            Team team = result.getTeam();
            Round round = result.getRound();
            Track track = team.getTrack();

            return TeamResultResponse.builder()
                    .teamReasultId(result.getId())
                    .teamId(team.getId())
                    .teamName(team.getName())
                    .trackId(track.getId())
                    .trackName(track.getName())
                    .RoundId(round.getId())
                    .roundName(round.getName())
                    .totalScore(result.getTotalScore())
                    .ranking(ranking)
                    .passed(result.isPassed())
                    .status(result.getStatus().name())
                    .build();
        }

        private List<TeamResultResponse> mapAndRecalculateRanking(List<TeamResult> results) {
            AtomicInteger ranking = new AtomicInteger(1);

            return results.stream()
                    .map(result -> mapToResponse(result, ranking.getAndIncrement()))
                    .toList();
        }
    private TeamResultResponse mapEventProjection(
            EventRankingProjection item,
            int ranking
    ) {
        return TeamResultResponse.builder()
                .teamId(item.getTeamId())
                .teamName(item.getTeamName())
                .trackId(item.getTrackId())
                .trackName(item.getTrackName())
                .totalScore(
                        Math.round(
                                item.getAverageScore() * 100.0
                        ) / 100.0
                )
                .ranking(ranking)
                .status("AGGREGATED")
                .build();
    }


    @Transactional
    public List<TeamRoundResultDTO> getTeamResultsByEvent(Long userId, Long eventId) {

         User user=userRepository.findById(userId).orElse(null);
         if(user==null){
             throw  new RuntimeException("khong tim thay user");
         }
        Member member=memberRepository.findByMemberIdAndStatus(user.getId(), MemberStatus.OFFICAL).orElse(null);
         if (member==null) {
         throw  new RuntimeException("khong tim thay member");
         }
         Team team=member.getTeam();





        List<TeamResult> results = teamResultRepository.findByTeamIdAndEventId( team.getId(), eventId);

        return results.stream().map(tr -> {

            // Tính toán Submission Status dựa trên cấu trúc thực tế của Round và TeamResult
            String submissionStatus = determineSubmissionStatus(tr.getRound(), tr, team.getId()).name();

            // 1. Tính tổng số đội tham gia vòng thi này
            int totalTeamsInRound = teamResultRepository.countTotalTeamsInRound(tr.getRound().getId());

            // 2. Xác định Track và tính tổng số đội trong Track đó
            String trackName = null;
            int totalTeamsInTrack = 0;

            if (tr.getTeam().getTrack() != null) {
                trackName = tr.getTeam().getTrack().getName();
                Long trackId = tr.getTeam().getTrack().getId();
                // Đếm số đội trong track
                totalTeamsInTrack = teamResultRepository.countTotalTeamsInTrack(trackId);
            }




            return TeamRoundResultDTO.builder()
                    .roundId(tr.getRound().getId())
                    .teamTotalScore(tr.getTotalScore())
                    // totalTeams ở đây đại diện cho tổng số đội thuộc Track
                    .teamRank(new TeamRoundResultDTO.TeamRankDTO(tr.getRanking(), totalTeamsInTrack))
                    .totalTeamsInRound(totalTeamsInRound)
                    .trackName(trackName)
                    .submissionStatus(submissionStatus)
                    .build();
        }).collect(Collectors.toList());
    }




    private SubmissionStatus determineSubmissionStatus(Round round, TeamResult teamResult, Long teamId) {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime start = round.getTimeStart();
        LocalDateTime end = round.getTimeEnd();
        LocalDateTime deadline = round.getSubmissionDeadline();

        // Nếu không cài deadline riêng, mặc định hạn nộp là lúc kết thúc vòng thi
        if (deadline == null) {
            deadline = end;
        }

        // 1. Tự tính toán trạng thái Vòng thi (UPCOMING / ACTIVE / DONE) dựa trên timeline thực tế
        String roundStatus = "UPCOMING";
        if (start != null && end != null) {
            if (now.isBefore(start)) {
                roundStatus = "UPCOMING";
            } else if (!now.isBefore(start) && !now.isAfter(end)) {
                roundStatus = "ACTIVE";
            } else {
                roundStatus = "DONE";
            }
        }

        // 2. Kiểm tra xem Đội đã nộp bài (Submission) trong vòng thi này chưa
        // Duyệt trong danh sách submissions của Round xem có bài nào có team.id khớp với teamId không
        boolean hasSubmission = false;
        if (round.getSubmissions() != null) {
            hasSubmission = round.getSubmissions().stream()
                    .anyMatch(sub -> sub.getTeam() != null && sub.getTeam().getId() == teamId);
        }

        // 3. Quyết định Trạng thái nộp bài (SubmissionStatus) gửi về React
        if ("UPCOMING".equals(roundStatus)) {
            return SubmissionStatus.NOT_OPEN;
        }

        if ("DONE".equals(roundStatus)) {
            return hasSubmission ? SubmissionStatus.SUBMITTED_ON_TIME : SubmissionStatus.CLOSED_NO_SUBMISSION;
        }

        if ("ACTIVE".equals(roundStatus)) {
            if (hasSubmission) {
                if (deadline != null && now.isAfter(deadline)) {
                    // Đã nộp bài thành công nhưng nộp sau hạn chót (nộp muộn)
                    return SubmissionStatus.LATE_NO_SUBMISSION;
                }
                return SubmissionStatus.READY; // Đã nộp bài thành công & đúng hạn
            } else {
                if (deadline != null && now.isAfter(deadline)) {
                    // Chưa nộp và đã quá hạn
                    return SubmissionStatus.LATE_NO_SUBMISSION;
                }
                // Chưa nộp nhưng vẫn trong hạn nộp
                return SubmissionStatus.NO_SUBMISSION;
            }
        }

        return SubmissionStatus.NOT_OPEN;
    }


    }

