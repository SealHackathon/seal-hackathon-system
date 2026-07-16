package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.TeamResultResponse;
import com.minhtung.hackathon.dto.response.TeamRoundResultDTO;
import com.minhtung.hackathon.dto.response.TeamRoundResultLecturerDTO;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.RankingScope;
import com.minhtung.hackathon.enums.SubmissionStatus;
import com.minhtung.hackathon.enums.TeamResultStatus;
import com.minhtung.hackathon.repository.*;
import com.minhtung.hackathon.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        private final RoundTrackRepository roundTrackRepository;
        private final EventService eventService;
        private final SubmissionRepository submissionRepository;

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


    //user view result cua minh o round do
    @Transactional
    public List<TeamRoundResultDTO> getTeamResultsByEvent(Long userId, Long eventId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("khong tim thay user");
        }

        Member member = memberRepository.findByMemberIdAndStatus(user.getId(), MemberStatus.OFFICAL).orElse(null);
        if (member == null) {
            throw new RuntimeException("khong tim thay member");
        }

        Team team = member.getTeam();

        // 1. Lấy TẤT CẢ round thuộc event này
        List<Round> allRounds = roundRepository.findByEventId(eventId);

        // 2. Lấy các TeamResult đã tồn tại của đội trong event này
        List<TeamResult> existingResults = teamResultRepository.findByTeamIdAndEventId(team.getId(), eventId);

        // 3. Map roundId -> TeamResult để tra cứu nhanh
        Map<Long, TeamResult> resultByRoundId = existingResults.stream()
                .collect(Collectors.toMap(tr -> tr.getRound().getId(), tr -> tr));

        // 4. Duyệt qua TẤT CẢ round để build DTO trả về
        return allRounds.stream().map(round -> {
            TeamResult tr = resultByRoundId.get(round.getId());

            String submissionStatus = determineSubmissionStatus(round, team.getId()).name();
            int totalTeamsInRound = teamResultRepository.countTotalTeamsInRound(round.getId());

            String trackName = null;
            int totalTeamsInTrack = 0;
            boolean isPublished = false; // Biến đánh dấu đã công bố kết quả chưa

            if (team.getTrack() != null) {
                trackName = team.getTrack().getName();
                totalTeamsInTrack = teamResultRepository.countTotalTeamsInTrack(team.getTrack().getId());

                // Nghiệp vụ mới: Check cấu hình công bố kết quả (Publish Stage) từ bảng round_track
                RoundTrack.RoundTrackId roundTrackId = new RoundTrack.RoundTrackId(round.getId(), team.getTrack().getId());

                isPublished = roundTrackRepository.findById(roundTrackId)
                        .map(rt -> rt.getPublishStage() ==3) // == 3 là công bố cho thí sinh xem rồi
                        .orElse(false); // Không tìm thấy cấu hình mặc định coi như chưa công bố
            }

            // Logic ẩn/hiển thị dựa trên biến công bố isPublished
            Double finalScore = (tr != null && isPublished) ? tr.getTotalScore() : null;
            Integer finalRanking = (tr != null && isPublished) ? tr.getRanking() : null;

            return TeamRoundResultDTO.builder()
                    .roundId(round.getId())
                    .teamTotalScore(finalScore) // Chỉ trả về điểm nếu đã công bố
                    .teamRank(new TeamRoundResultDTO.TeamRankDTO(
                            finalRanking,      // Chỉ trả về rank nếu đã công bố
                            totalTeamsInTrack))
                    .totalTeamsInRound(totalTeamsInRound)
                    .trackName(trackName)
                    .submissionStatus(submissionStatus)
                    .build();
        }).collect(Collectors.toList());
    }


    private SubmissionStatus determineSubmissionStatus(Round round, Long teamId) {
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
                    return SubmissionStatus.LATE_NO_SUBMISSION;
                }
                return SubmissionStatus.READY; // Đã nộp bài thành công & đúng hạn
            } else {
                if (deadline != null && now.isAfter(deadline)) {
                    return SubmissionStatus.LATE_NO_SUBMISSION;
                }
                return SubmissionStatus.NO_SUBMISSION; // Chưa nộp, còn trong hạn -> hiện nút "Nộp bài"
            }
        }

        return SubmissionStatus.NOT_OPEN;
    }

    @Transactional
    public List<TeamRoundResultLecturerDTO> getTeamResultsByTeamId(Long teamId, Long eventId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("khong tim thay team"));

        List<Round> allRounds = roundRepository.findByEventId(eventId);
        List<TeamResult> existingResults = teamResultRepository.findByTeamIdAndEventId(team.getId(), eventId);
        Map<Long, TeamResult> resultByRoundId = existingResults.stream()
                .collect(Collectors.toMap(tr -> tr.getRound().getId(), tr -> tr));

        return allRounds.stream().map(round -> {
            TeamResult tr = resultByRoundId.get(round.getId());

            String submissionStatus = determineSubmissionStatus(round, team.getId()).name();
            int totalTeamsInRound = teamResultRepository.countTotalTeamsInRound(round.getId());

            String trackName = null;
            int totalTeamsInTrack = 0;
            boolean isPublished = false;

            if (team.getTrack() != null) {
                trackName = team.getTrack().getName();
                totalTeamsInTrack = teamResultRepository.countTotalTeamsInTrack(team.getTrack().getId());

                RoundTrack.RoundTrackId roundTrackId = new RoundTrack.RoundTrackId(round.getId(), team.getTrack().getId());
                isPublished = roundTrackRepository.findById(roundTrackId)
                        .map(rt -> rt.getPublishStage() == 3)
                        .orElse(false);
            }

            Double finalScore = (tr != null && isPublished) ? tr.getTotalScore() : null;
            Integer finalRanking = (tr != null && isPublished) ? tr.getRanking() : null;

            // ---- Submission thực tế (link + thời gian nộp) ----
            TeamRoundResultLecturerDTO.SubmissionDTO submissionDTO = submissionRepository
                    .findByTeam_IdAndRound_IdAndLatestTrue(team.getId(), round.getId())
                    .map(s -> TeamRoundResultLecturerDTO.SubmissionDTO.builder()
                            .githubUrl(s.getGithubUrl())
                            .demoUrl(s.getDemoUrl())
                            .documentUrl(s.getDocumentUrl())
                            .submittedAt(s.getSubmittedAt())
                            .build())
                    .orElse(null);

            // ---- Tính trễ hạn thủ công, không dựa vào enum ----
            Boolean late = null;
            if (submissionDTO != null && submissionDTO.getSubmittedAt() != null && round.getSubmissionDeadline() != null) {
                late = submissionDTO.getSubmittedAt().isAfter(round.getSubmissionDeadline());
            }

            // ---- Neighbors (chỉ tính khi đã công bố và có rank) ----
            List<TeamRoundResultLecturerDTO.NeighborDTO> neighbors = null;
            if (isPublished && finalRanking != null && team.getTrack() != null) {
                int from = Math.max(1, finalRanking - 1);
                int to = finalRanking + 1;
                List<TeamResult> neighborResults = teamResultRepository.findNeighborsByRank(
                        round.getId(), team.getTrack().getId(), from, to);

                neighbors = neighborResults.stream()
                        .map(nr -> TeamRoundResultLecturerDTO.NeighborDTO.builder()
                                .teamId(nr.getTeam().getId())
                                .teamName(nr.getTeam().getName())
                                .rank(nr.getRanking())
                                .score(nr.getTotalScore())
                                .isSelf(nr.getTeam().getId() == team.getId())
                                .build())
                        .collect(Collectors.toList());
            }

            return TeamRoundResultLecturerDTO.builder()
                    .roundId(round.getId())
                    .roundName(round.getName())
                    .ordinalNumber(round.getOrdinal_number())
                    .timeStart(round.getTimeStart())
                    .timeEnd(round.getTimeEnd())
                    .teamTotalScore(finalScore)
                    .teamRank(new TeamRoundResultLecturerDTO.TeamRankDTO(finalRanking, totalTeamsInTrack))
                    .totalTeamsInRound(totalTeamsInRound)
                    .trackName(trackName)
                    .submissionStatus(submissionStatus)
                    .submission(submissionDTO)
                    .late(late)
                    .neighbors(neighbors)
                    .build();
        }).collect(Collectors.toList());
    }



    }

