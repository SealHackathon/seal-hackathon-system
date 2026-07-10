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
        response.setAwards(null); // TODO: chưa có bảng Award
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
}