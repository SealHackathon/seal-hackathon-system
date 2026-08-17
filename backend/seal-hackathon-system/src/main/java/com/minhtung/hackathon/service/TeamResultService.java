package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.*;
import com.minhtung.hackathon.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
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
    private final MentorAssignmentRepository mentorAssignmentRepository;


    @Transactional
    public List<TeamResultResponse> getTrackRanking(Long trackId, Long roundId) {
        if (!trackRepository.existsById(trackId)) {
            throw new RuntimeException("khong tim thay track");
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("khong tim thay round"));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("khong tim thay track"));

        if (track.getEvent().getId() != round.getEvent().getId()) {
            throw new RuntimeException("Track và Round không cùng Event");
        }

        List<TeamResult> results =
                teamResultRepository.findByTeamTrackIdAndRoundIdOrderByTotalScoreDesc(trackId, roundId);

        return mapAndRecalculateRanking(results);
    }

    @Transactional
    public List<TeamResultResponse> getRoundRanking(Long roundId) {
        if (!roundRepository.existsById(roundId)) {
            throw new RuntimeException("khong tim thay round");
        }
        // Lấy toàn bộ kết quả các đội trong Round (đã sắp xếp TotalScore giảm dần)
        List<TeamResult> results = teamResultRepository.findByRoundIdOrderByTotalScoreDesc(roundId);

        // Đánh lại thứ tự BXH chung cho toàn Vòng thi từ 1 -> N
        return mapAndRecalculateRanking(results);
    }

    @Transactional
    public List<TeamResultResponse> getEventRanking(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("khong tim thay event");
        }
        List<EventRankingProjection> result = teamResultRepository.findEventRanking(eventId);

        AtomicInteger ranking = new AtomicInteger(1);
        return result.stream()
                .map(item -> mapEventProjection(item, ranking.getAndIncrement()))
                .toList();
    }

    @Transactional
    public void publishTrackResults(Long trackId, Long roundId) {
        if (!trackRepository.existsById(trackId)) {
            throw new RuntimeException("khong tim thay track");
        }
        if (!roundRepository.existsById(roundId)) {
            throw new RuntimeException("khong tim thay round");
        }
        int updated = teamResultRepository.publishTrackResults(trackId, roundId, TeamResultStatus.official);

        if (updated == 0) {
            throw new RuntimeException("khong co ket qua nao de cong bo ");
        }
    }

    @Transactional
    public List<TeamResultResponse> getPublicRanking(RankingScope scope, Long id, Long roundId) {
        return switch (scope) {
            case TRACK -> {
                if (roundId == null) {
                    throw new RuntimeException("roundId là bắt buộc khi xem Track");
                }

                List<TeamResult> results =
                        teamResultRepository
                                .findByTeamTrackIdAndRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        roundId,
                                        TeamResultStatus.official
                                );

                yield mapAndRecalculateRanking(results);
            }

            case ROUND -> {
                List<TeamResult> results =
                        teamResultRepository
                                .findByRoundIdAndStatusOrderByTotalScoreDesc(
                                        id,
                                        TeamResultStatus.official
                                );

                yield mapAndRecalculateRanking(results);
            }

            case EVENT -> {
                List<EventRankingProjection> results =
                        teamResultRepository
                                .findPublishedEventRanking(
                                        id,
                                        TeamResultStatus.official
                                );

                AtomicInteger ranking = new AtomicInteger(1);

                yield results.stream()
                        .map(item -> mapEventProjection(item, ranking.getAndIncrement()))
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
                .trackId(track != null ? track.getId() : null)
                .trackName(track != null ? track.getName() : null)
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

    private TeamResultResponse mapEventProjection(EventRankingProjection item, int ranking) {
        return TeamResultResponse.builder()
                .teamId(item.getTeamId())
                .teamName(item.getTeamName())
                .trackId(item.getTrackId())
                .trackName(item.getTrackName())
                .totalScore(Math.round(item.getAverageScore() * 100.0) / 100.0)
                .ranking(ranking)
                .status("AGGREGATED")
                .build();
    }

    // 1. Dùng chung bộ tính toán trạng thái nộp bài có xử lý cờ bị loại
    private SubmissionStatus determineSubmissionStatus(Round round, Long teamId, boolean isEliminated) {
        if (isEliminated) {
            return SubmissionStatus.ELIMINATED;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = round.getTimeStart();
        LocalDateTime end = round.getTimeEnd();
        LocalDateTime deadline = round.getSubmissionDeadline() != null ? round.getSubmissionDeadline() : end;

        // Tự tính toán trạng thái Vòng thi (UPCOMING / ACTIVE / DONE)
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

        // Kiểm tra xem Đội đã nộp bài trong vòng thi này chưa
        boolean hasSubmission = false;
        if (round.getSubmissions() != null) {
            hasSubmission = round.getSubmissions().stream()
                    .anyMatch(sub -> sub.getTeam() != null && sub.getTeam().getId()==(teamId));
        }

        if ("UPCOMING".equals(roundStatus)) {
            return SubmissionStatus.NOT_OPEN;
        }

        if ("DONE".equals(roundStatus)) {
            return hasSubmission ? SubmissionStatus.SUBMITTED_ON_TIME : SubmissionStatus.CLOSED_NO_SUBMISSION;
        }

        if ("ACTIVE".equals(roundStatus)) {
            if (hasSubmission) {
                if (deadline != null && now.isAfter(deadline)) {
                    return SubmissionStatus.READY;
                }
                return SubmissionStatus.READY;
            } else {
                if (deadline != null && now.isAfter(deadline)) {
                    return SubmissionStatus.LATE_NO_SUBMISSION;
                }
                return SubmissionStatus.NO_SUBMISSION;
            }
        }

        return SubmissionStatus.NOT_OPEN;
    }

    // 2. User view result của mình ở event đó (Thí sinh xem)
    @Transactional
    public List<TeamRoundResultDTO> getTeamResultsByEvent(Long userId, Long eventId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("khong tim thay user"));

        Member member = memberRepository.findByMemberIdAndStatus(user.getId(), MemberStatus.OFFICAL)
                .orElseThrow(() -> new RuntimeException("khong tim thay member"));

        Team team = member.getTeam();
        if (team == null) {
            throw new RuntimeException("khong tim thay team cua member");
        }

        List<Round> allRounds = roundRepository.findByEventId(eventId);
        allRounds.sort(Comparator.comparingInt(Round::getOrdinal_number));

        List<TeamResult> existingResults = teamResultRepository.findByTeamIdAndEventId(team.getId(), eventId);

        Map<Long, TeamResult> resultByRoundId = existingResults.stream()
                .collect(Collectors.toMap(tr -> tr.getRound().getId(), tr -> tr));

        List<TeamRoundResultDTO> results = new ArrayList<>();
        boolean eliminatedSoFar = false;

        for (Round round : allRounds) {
            TeamResult tr = resultByRoundId.get(round.getId());

            String submissionStatus = determineSubmissionStatus(round, team.getId(), eliminatedSoFar).name();
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

            TeamRoundResultDTO dto = TeamRoundResultDTO.builder()
                    .roundId(round.getId())
                    .teamTotalScore(finalScore)
                    .teamRank(new TeamRoundResultDTO.TeamRankDTO(
                            finalRanking,
                            totalTeamsInTrack))
                    .totalTeamsInRound(totalTeamsInRound)
                    .trackName(trackName)
                    .submissionStatus(submissionStatus)
                    .build();

            results.add(dto);

            if (tr != null && isPublished && !tr.isPassed()) {
                eliminatedSoFar = true;
            }
        }

        return results;
    }

    // 3. Lấy kết quả bằng teamId (MENTOR - Judge Xem)
    @Transactional
    public List<TeamRoundResultLecturerDTO> getTeamResultsByTeamId(Long teamId, Long eventId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("khong tim thay team"));

        List<Round> allRounds = roundRepository.findByEventId(eventId);
        allRounds.sort(Comparator.comparingInt(Round::getOrdinal_number));

        List<TeamResult> existingResults = teamResultRepository.findByTeamIdAndEventId(team.getId(), eventId);
        Map<Long, TeamResult> resultByRoundId = existingResults.stream()
                .collect(Collectors.toMap(tr -> tr.getRound().getId(), tr -> tr));

        List<TeamRoundResultLecturerDTO> results = new ArrayList<>();
        boolean eliminatedSoFar = false;

        for (Round round : allRounds) {
            TeamResult tr = resultByRoundId.get(round.getId());

            String submissionStatus = determineSubmissionStatus(round, team.getId(), eliminatedSoFar).name();
            int totalTeamsInRound = teamResultRepository.countTotalTeamsInRound(round.getId());

            String trackName = null;
            int totalTeamsInTrack = 0;
            boolean isPublished = false;

            if (team.getTrack() != null) {
                trackName = team.getTrack().getName();
                totalTeamsInTrack = teamResultRepository.countTotalTeamsInTrack(team.getTrack().getId());

                RoundTrack.RoundTrackId roundTrackId = new RoundTrack.RoundTrackId(round.getId(), team.getTrack().getId());
                isPublished = roundTrackRepository.findById(roundTrackId)
                        .map(rt -> rt.getPublishStage() == 2)
                        .orElse(false);
            }

            Double finalScore = (tr != null && isPublished) ? tr.getTotalScore() : null;
            Integer finalRanking = (tr != null && isPublished) ? tr.getRanking() : null;

            TeamRoundResultLecturerDTO.SubmissionDTO submissionDTO = submissionRepository
                    .findByTeam_IdAndRound_IdAndLatestTrue(team.getId(), round.getId())
                    .map(s -> TeamRoundResultLecturerDTO.SubmissionDTO.builder()
                            .githubUrl(s.getGithubUrl())
                            .demoUrl(s.getDemoUrl())
                            .documentUrl(s.getDocumentUrl())
                            .submittedAt(s.getSubmittedAt())
                            .build())
                    .orElse(null);

            Boolean late = null;
            if (submissionDTO != null && submissionDTO.getSubmittedAt() != null && round.getSubmissionDeadline() != null) {
                late = submissionDTO.getSubmittedAt().isAfter(round.getSubmissionDeadline());
            }

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
                                .isSelf(nr.getTeam().getId()==(team.getId()))
                                .build())
                        .collect(Collectors.toList());
            }

            TeamRoundResultLecturerDTO dto = TeamRoundResultLecturerDTO.builder()
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

            results.add(dto);

            if (tr != null && isPublished && !tr.isPassed()) {
                eliminatedSoFar = true;
            }
        }

        return results;
    }


    //--------------------------------API getLeaderboard (Xếp hạng theo toàn Round)----------------------
    @Transactional
    public List<LeaderboardTeamDTO.Team> getLeaderboard(long roundId, long eventId, long currentUserId) {

        // 1. Kiểm tra sự tồn tại của User
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Lấy danh sách RoundTrack để kiểm tra publishStage của Round
        List<RoundTrack> roundTracks = roundTrackRepository.findByRoundId(roundId);
        if (roundTracks.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found RoundTrack for this round");
        }

        // Lấy publishStage nhỏ nhất trong các Track của Round
        int currentStage = roundTracks.stream()
                .mapToInt(rt -> rt.getPublishStage() != null ? rt.getPublishStage() : 1)
                .min()
                .orElse(1);

        // 3. Validate quyền xem dựa vào Stage và Role của User
        validateAccessRight(currentUser, currentStage);

        // 4. Lấy tất cả Track ID mà User đang làm Mentor trong Event này
        Set<Long> mentorerTrackIds = mentorAssignmentRepository
                .findByUserIdAndEventId(currentUserId, eventId)
                .stream()
                .map(ma -> ma.getTrack().getId())
                .collect(Collectors.toSet());

        // 5. Query dữ liệu bằng cách kết hợp 2 Query để tránh MultipleBagFetchException
        List<TeamResult> teamResults = teamResultRepository.findBasicFullByRoundId(roundId);
        if (!teamResults.isEmpty()) {
            teamResultRepository.fetchJudgeScoreDetailsByRoundId(roundId);
        }

        // 6. Sắp xếp toàn bộ các đội trong Round theo điểm số tổng (TotalScore) giảm dần
        teamResults.sort((tr1, tr2) -> {
            Double score1 = tr1.getTotalScore() ;
            Double score2 = tr2.getTotalScore() ;
            return Double.compare(score2, score1);
        });

        // 7. Đánh lại thứ hạng (Rank) cho toàn bộ Vòng thi (1 -> N)
        AtomicInteger roundRank = new AtomicInteger(1);

        return teamResults.stream()
                .map(tr -> toTeamDTO(tr, mentorerTrackIds, roundRank.getAndIncrement()))
                .collect(Collectors.toList());
    }

    private void validateAccessRight(User user, int stage) {
        Role role = user.getRole();

        if (Role.ADMIN.equals(role)) {
            return;
        }

        switch (stage) {
            case 1:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Stage 1: Leaderboard is locked for non-admin");
            case 2:
                if (!Role.LECTURER.equals(role)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Stage 2: Leaderboard is only accessible by Lecturers");
                }
                break;
            case 3:
                break;
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid publish stage");
        }
    }

    /**
     * Map dữ liệu TeamResult sang DTO với thứ hạng đã được tính lại theo Round (calculatedRank).
     */
    private LeaderboardTeamDTO.Team toTeamDTO(TeamResult tr, Set<Long> mentorerTrackIds, int calculatedRank) {
        Team team = tr.getTeam();

        boolean isMentorOfThisTeamTrack = team != null
                && team.getTrack() != null
                && mentorerTrackIds.contains(team.getTrack().getId());

        if (isMentorOfThisTeamTrack) {
            return LeaderboardTeamDTO.Team.builder()
                    .id(team.getId())
                    .teamName(team.getName())
                    .rank(calculatedRank)
                    .avgScore(tr.getTotalScore())
                    .status(null)
                    .discrepancy(false)
                    .judges(null)
                    .build();
        }

        List<LeaderboardTeamDTO.JudgeScore> judges = tr.getJudgeScores().stream()
                .map(this::toJudgeScoreDTO)
                .collect(Collectors.toList());

        return LeaderboardTeamDTO.Team.builder()
                .id(team.getId())
                .teamName(team.getName())
                .rank(calculatedRank)
                .avgScore(tr.getTotalScore())
                .status(tr.getStatus() != null ? tr.getStatus().name() : null)
                .discrepancy(false)
                .judges(judges)
                .build();
    }

    private LeaderboardTeamDTO.JudgeScore toJudgeScoreDTO(JudgeScore js) {
        User user = js.getJudgeAssignment().getUser();

        List<LeaderboardTeamDTO.CriteriaScore> criteriaScores = js.getDetails().stream()
                .map(d -> new LeaderboardTeamDTO.CriteriaScore(d.getCriterion().getName(), d.getScore()))
                .collect(Collectors.toList());

        return new LeaderboardTeamDTO.JudgeScore(
                user.getId(),
                user.getFullName(),
                js.getTotalScore(),
                criteriaScores
        );
    }

    public MyContextResponseDTO getMyContext(Long roundId, Long currentUserId) {

        // 1. Kiểm tra xem user có phải là Mentor hay không
        boolean isMentor = !mentorAssignmentRepository.findByUserId(currentUserId).isEmpty();

        // 2. Lấy bảng xếp hạng chung của TOÀN ROUND (đã sắp xếp TotalScore giảm dần)
        List<TeamResult> allRoundResults = teamResultRepository.findByRoundIdOrderByTotalScoreDesc(roundId);

        // 3. Tạo một Map để tra cứu Rank toàn Round theo teamId: Map<teamId, roundRank>
        Map<Long, Integer> teamRoundRankMap = new HashMap<>();
        for (int i = 0; i < allRoundResults.size(); i++) {
            teamRoundRankMap.put(allRoundResults.get(i).getTeam().getId(), i + 1);
        }

        if (isMentor) {
            // Trường hợp 1: Người gọi là MENTOR -> Lấy danh sách đội
            List<TeamSummaryDTO> mentorTeams = teamResultRepository.findMentorTeamsResultByRound(roundId, currentUserId);

            // Gán lại Rank chuẩn theo TOÀN ROUND cho từng đội của Mentor
            mentorTeams.forEach(teamDto -> {
                Integer roundRank = teamRoundRankMap.get(teamDto.getId());
                teamDto.setRank(roundRank); // Đã gán Rank mới theo Round
            });

            // Sắp xếp lại danh sách đội của Mentor theo Rank toàn Round tăng dần (Đội hạng cao xếp trước)
            mentorTeams.sort(Comparator.comparing(
                    TeamSummaryDTO::getRank,
                    Comparator.nullsLast(Comparator.naturalOrder())
            ));

            return MyContextResponseDTO.builder()
                    .role("MENTOR")
                    .myTeam(null)
                    .myMentorTeams(mentorTeams)
                    .build();
        } else {
            // Trường hợp 2: Người gọi là Thí sinh (TEAM)
            TeamSummaryDTO myTeam = teamResultRepository.findMyTeamResultByRound(roundId, currentUserId)
                    .orElse(null);

            if (myTeam != null) {
                // Gán lại Rank chuẩn theo TOÀN ROUND cho đội của thí sinh
                Integer roundRank = teamRoundRankMap.get(myTeam.getId());
                myTeam.setRank(roundRank);
            }

            return MyContextResponseDTO.builder()
                    .role("TEAM")
                    .myTeam(myTeam)
                    .myMentorTeams(new ArrayList<>())
                    .build();
        }
    }
}