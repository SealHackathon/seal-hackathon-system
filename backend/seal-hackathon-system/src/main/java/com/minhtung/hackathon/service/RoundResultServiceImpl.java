package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.result.*;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.JudgeScoreStatus;
import com.minhtung.hackathon.dto.result.RoundResultResponse;
import com.minhtung.hackathon.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundResultServiceImpl implements RoundResultService {

    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final JudgeScoreRepository judgeScoreRepository;
    private final TrackRepository trackRepository;

    @Override
    public RoundResultResponse getRoundResults(Long roundId,Long trackId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found: " + roundId));

        List<Submission> submissions = submissionRepository.findByRound_IdAndLatestTrue(roundId);
        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByRound_Id(roundId);
        List<JudgeScore> scores = judgeScoreRepository.findAllByRoundIdWithDetails(roundId);

        // Lọc theo trackId nếu FE truyền category cụ thể (khác "all")
        if (trackId != null) {
            submissions = submissions.stream()
                    .filter(s -> s.getTeam().getTrack() != null && s.getTeam().getTrack().getId() == trackId)
                    .toList();
            assignments = assignments.stream()
                    .filter(a -> a.getTrack() != null && a.getTrack().getId() == trackId)
                    .toList();
        }



        Map<String, JudgeScore> scoreIndex = new HashMap<>();
        for (JudgeScore s : scores) {
            scoreIndex.put(s.getJudgeAssignment().getId() + "-" + s.getSubmission().getId(), s);
        }

        Map<Long, List<Submission>> submissionsByTrack = submissions.stream()
                .filter(s -> s.getTeam().getTrack() != null)
                .collect(Collectors.groupingBy(s -> s.getTeam().getTrack().getId()));

        Map<Long, List<JudgeAssignment>> assignmentsByTrack = assignments.stream()
                .filter(a -> a.getTrack() != null)
                .collect(Collectors.groupingBy(a -> a.getTrack().getId()));

        List<EntryDTO> entries = new ArrayList<>();
        for (Submission submission : submissions) {
            Team team = submission.getTeam();
            List<JudgeAssignment> teamJudges = trackId != null
                    ? assignmentsByTrack.getOrDefault(trackId, List.of())
                    : List.of();

            List<JudgeScoreDTO> perJudge = new ArrayList<>();
            for (JudgeAssignment ja : teamJudges) {
                JudgeScore score = scoreIndex.get(ja.getId() + "-" + submission.getId());
                boolean submitted = score != null && score.getStatus() == JudgeScoreStatus.SUBMITTED;

                JudgeScoreDTO dto = new JudgeScoreDTO();
                dto.setJudge(ja.getUser().getFullName()); // TODO: đổi đúng field tên hiển thị của User
                dto.setSubmitted(submitted);
                if (submitted) {
                    Map<String, Double> scoreMap = new LinkedHashMap<>();
                    for (JudgeScoreDetail d : score.getDetails()) {
                        scoreMap.put(String.valueOf(d.getCriterion().getId()), d.getScore());
                    }
                    dto.setScores(scoreMap);
                    // total score

                    dto.setTotal(score.getTotalScore());
                }
                perJudge.add(dto);
            }

            EntryDTO entry = new EntryDTO();
            entry.setTeam(toTeamDTO(team));
            entry.setAssignedCount(teamJudges.size());
            entry.setPerJudge(perJudge);
            entry.setDiscrepancy(computeDiscrepancy(perJudge));
            // TODO: ended / violation / tieBreakNote -> chưa có bảng lưu, xem ghi chú trước đó
            entries.add(entry);
        }

        List<JudgeSummaryDTO> judgeSummaries = new ArrayList<>();
        Map<Long, JudgeAssignment> distinctJudgeByUser = new LinkedHashMap<>();
        for (JudgeAssignment ja : assignments) {
            distinctJudgeByUser.putIfAbsent(ja.getUser().getId(), ja);
        }
        for (JudgeAssignment ja : distinctJudgeByUser.values()) {
            List<Submission> teamSubs = trackId != null
                    ? submissionsByTrack.getOrDefault(trackId, List.of())
                    : List.of();

            int assignedCount = teamSubs.size();
            int scoredCount = 0;
            LocalDateTime lastUpdate = null;
            for (Submission s : teamSubs) {
                JudgeScore score = scoreIndex.get(ja.getId() + "-" + s.getId());
                if (score != null && score.getStatus() == JudgeScoreStatus.SUBMITTED) {
                    scoredCount++;
                    LocalDateTime updated = score.getUpdatedAt() != null ? score.getUpdatedAt() : score.getSubmitAt();
                    if (lastUpdate == null || (updated != null && updated.isAfter(lastUpdate))) {
                        lastUpdate = updated;
                    }
                }
            }

            JudgeSummaryDTO summary = new JudgeSummaryDTO();
            summary.setId(String.valueOf(ja.getUser().getId()));
            summary.setName(ja.getUser().getFullName()); // TODO: đổi đúng field tên hiển thị của User
            summary.setAssigned(assignedCount);
            summary.setScored(scoredCount);
            summary.setLastUpdate(lastUpdate);
            judgeSummaries.add(summary);
        }

        RoundResultResponse response = new RoundResultResponse();
        response.setJudges(judgeSummaries);
        response.setEntries(entries);
        response.setUpdatedAt(computeLatestUpdate(scores));
        response.setReview(null); // TODO: chưa có bảng lưu trạng thái publish flow
        response.setAwards(computeAwardsAutomatically(entries)); // TODO: chưa có bảng Award
        return response;
    }

    private DiscrepancyDTO computeDiscrepancy(List<JudgeScoreDTO> perJudge) {
        List<Double> totals = perJudge.stream()
                .filter(JudgeScoreDTO::isSubmitted)
                .map(JudgeScoreDTO::getTotal)
                .filter(Objects::nonNull)
                .toList();
        if (totals.size() < 2) return null;

        double mean = totals.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double variance = totals.stream().mapToDouble(t -> Math.pow(t - mean, 2)).average().orElse(0);
        double stdDev = Math.sqrt(variance);

        // TODO: ngưỡng 1.0 là tạm, nên lấy từ ScoringTemplate.standardDeviation của round
        boolean flagged = stdDev > 1.0;
        return flagged ? new DiscrepancyDTO(true, Math.round(stdDev * 100) / 100.0) : null;
    }

    private LocalDateTime computeLatestUpdate(List<JudgeScore> scores) {
        return scores.stream()
                .map(s -> s.getUpdatedAt() != null ? s.getUpdatedAt() : s.getSubmitAt())
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }

    private TeamDTO toTeamDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        return dto;
    }

    // tính toán điểm tự động
    private AwardsDTO computeAwardsAutomatically(List<EntryDTO> entries) {
        // 1. Tạo cấu trúc chứa Team và điểm trung bình của Team đó
        class TeamScore {
            TeamDTO team;
            double averageScore;

            TeamScore(TeamDTO team, double averageScore) {
                this.team = team;
                this.averageScore = averageScore;
            }
        }

        List<TeamScore> teamScores = new ArrayList<>();

        // 2. Tính điểm trung bình của từng đội từ danh sách chấm của Giám khảo
        for (EntryDTO entry : entries) {
            List<Double> submittedScores = entry.getPerJudge().stream()
                    .filter(JudgeScoreDTO::isSubmitted)
                    .map(JudgeScoreDTO::getTotal)
                    .filter(Objects::nonNull)
                    .toList();

            // Chỉ tính giải cho các đội đã được ít nhất 1 giám khảo chấm và submit
            if (!submittedScores.isEmpty()) {
                double avg = submittedScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                // Làm tròn 2 chữ số thập phân
                double finalScore = Math.round(avg * 100.0) / 100.0;
                teamScores.add(new TeamScore(entry.getTeam(), finalScore));
            }
        }

        // 3. Sắp xếp các đội theo điểm số giảm dần (Cao nhất đứng đầu)
        teamScores.sort((a, b) -> Double.compare(b.averageScore, a.averageScore));

        // 4. Gán giải thưởng MAIN (Nhất, Nhì, Ba) dựa trên top 3
        List<MainAwardDTO> mainAwards = new ArrayList<>();
        String[] rankKeys = {"first", "second", "third"};

        for (int i = 0; i < Math.min(teamScores.size(), rankKeys.length); i++) {
            TeamScore ts = teamScores.get(i);

            MainAwardDTO mainDto = new MainAwardDTO();
            mainDto.setKey(rankKeys[i]);
            mainDto.setTeam(ts.team);
            mainDto.setScore(ts.averageScore);

            mainAwards.add(mainDto);
        }

        // 5. Kết hợp vào AwardsDTO (Extended tạm thời để trống hoặc lấy từ nguồn khác vì ko tự tính được)
        AwardsDTO awardsDTO = new AwardsDTO();
        awardsDTO.setMain(mainAwards);
        awardsDTO.setExtended(new ArrayList<>()); //TODO: đang để trống giải phụ phai tự gán tay

        return awardsDTO;
    }




    //public award

    public PublicRoundResultResponse getPublicRoundResultsByTrack(Long roundId, Long trackId) {
        if (trackId == null) {
            throw new IllegalArgumentException("Track ID is required for public results");
        }

        // 1. Tìm thông tin Track để kiểm tra trạng thái công bố trực tiếp
        // Giả sử bạn đã inject TrackRepository vào Service này rồi nhé
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new EntityNotFoundException("Track not found: " + trackId));

        PublicRoundResultResponse response = new PublicRoundResultResponse();

        // Kiểm tra trực tiếp trên thực thể Track
        if (!track.isPublishedResult()) {
            response.setPublished(false);
            response.setEntries(new ArrayList<>());
            response.setAwards(null);
            return response;
        }

        // 2. Lấy dữ liệu Submissions và Scores (chỉ lọc các bản ghi thuộc Track này)
        List<Submission> submissions = submissionRepository.findByRound_IdAndLatestTrue(roundId).stream()
                .filter(s -> s.getTeam().getTrack() != null && s.getTeam().getTrack().getId()==(trackId))
                .toList();

        List<JudgeScore> scores = judgeScoreRepository.findAllByRoundIdWithDetails(roundId);
        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByRound_Id(roundId).stream()
                .filter(a -> a.getTrack() != null && a.getTrack().getId()  == (trackId))
                .toList();

        // Map để index score: "assignmentId-submissionId" -> JudgeScore
        Map<String, JudgeScore> scoreIndex = new HashMap<>();
        for (JudgeScore s : scores) {
            scoreIndex.put(s.getJudgeAssignment().getId() + "-" + s.getSubmission().getId(), s);
        }

        // 3. Tính điểm trung bình công khai cho từng đội trong Track
        List<PublicEntryDTO> publicEntries = new ArrayList<>();
        for (Submission submission : submissions) {
            List<Double> submittedTotals = new ArrayList<>();

            for (JudgeAssignment ja : assignments) {
                JudgeScore score = scoreIndex.get(ja.getId() + "-" + submission.getId());
                if (score != null && score.getStatus() == com.minhtung.hackathon.enums.JudgeScoreStatus.SUBMITTED) {
                    submittedTotals.add(score.getTotalScore());
                }
            }

            if (!submittedTotals.isEmpty()) {
                double avg = submittedTotals.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

                PublicEntryDTO entry = new PublicEntryDTO();
                entry.setTeam(toTeamDTO(submission.getTeam()));
                entry.setFinalScore(Math.round(avg * 100.0) / 100.0);
                publicEntries.add(entry);
            }
        }

        // 4. Sắp xếp danh sách đội theo điểm giảm dần và đánh số Rank
        publicEntries.sort((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()));
        for (int i = 0; i < publicEntries.size(); i++) {
            publicEntries.get(i).setRank(i + 1);
        }

        // 5. Tự động lấy TOP 3 trao giải MAIN (Nhất, Nhì, Ba) cho riêng Track này
        List<MainAwardDTO> mainAwards = new ArrayList<>();
        String[] rankKeys = {"first", "second", "third"};
        for (int i = 0; i < Math.min(publicEntries.size(), rankKeys.length); i++) {
            PublicEntryDTO pe = publicEntries.get(i);

            MainAwardDTO mainDto = new MainAwardDTO();
            mainDto.setKey(rankKeys[i]);
            mainDto.setTeam(pe.getTeam());
            mainDto.setScore(pe.getFinalScore());

            mainAwards.add(mainDto);
        }

        AwardsDTO awardsDTO = new AwardsDTO();
        awardsDTO.setMain(mainAwards);
        awardsDTO.setExtended(new ArrayList<>());

        // 6. Đóng gói kết quả trả về
        response.setPublished(true);
        response.setEntries(publicEntries);
        response.setAwards(awardsDTO);

        return response;
    }
}