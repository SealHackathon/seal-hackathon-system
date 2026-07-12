package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.entity.Submission;
import com.minhtung.hackathon.entity.JudgeScore;
import com.minhtung.hackathon.enums.JudgeScoreStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class SubmissionResponse {
    private Long id;
    private Long teamId;
    private Long roundId;
    private String githubUrl;
    private String demoUrl;
    private String documentUrl;
    private LocalDateTime submittedAt;
    private boolean latest;
    private Boolean isLate;
    private LocalDateTime lastEditedAt;


    private Double score;               // Điểm trung bình cộng của Hội đồng
    private List<String> comments;      // Danh sách tất cả nhận xét từ các giám khảo
    private Integer judgesCount;        // Số lượng giám khảo đã nộp điểm chính thức

    public static SubmissionResponse from(Submission submission, List<JudgeScore> judgeScores) {
        if (submission == null) return null;

        // 1. Kiểm tra nộp muộn (Deadline)
        boolean checkLate = false;
        if (submission.getRound() != null && submission.getRound().getSubmissionDeadline() != null) {
            checkLate = submission.getSubmittedAt().isAfter(submission.getRound().getSubmissionDeadline());
        }

        // 2. Lọc các bảng điểm đã SUBMITTED chính thức từ Hội đồng
        List<JudgeScore> officialScores = (judgeScores != null) ? judgeScores.stream()
                                                                  .filter(score -> score.getStatus() == JudgeScoreStatus.SUBMITTED)
                                                                  .toList() : List.of();

        // 3. Tính toán điểm trung bình cộng (Làm tròn 2 chữ số thập phân)
        Double avgScore = null;
        if (!officialScores.isEmpty()) {
            double sum = officialScores.stream().mapToDouble(JudgeScore::getTotalScore).sum();
            avgScore = Math.round((sum / officialScores.size()) * 100.0) / 100.0;
        }

        // 4. Gom tất cả nhận xét không rỗng của các giám khảo
        List<String> allComments = officialScores.stream()
                .map(JudgeScore::getComment)
                .filter(comment -> comment != null && !comment.trim().isEmpty())
                .collect(Collectors.toList());

        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam() != null ? submission.getTeam().getId() : null)
                .roundId(submission.getRound() != null ? submission.getRound().getId() : null)
                .githubUrl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documentUrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .latest(submission.isLatest())
                .isLate(checkLate)
                .lastEditedAt(submission.getSubmittedAt())

                // Đổ dữ liệu hội đồng vào DTO
                .score(avgScore)
                .comments(allComments)
                .judgesCount(officialScores.size())
                .build();
    }
}