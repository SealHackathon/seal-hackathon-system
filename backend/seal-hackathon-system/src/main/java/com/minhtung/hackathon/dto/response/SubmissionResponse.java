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

    public static SubmissionResponse from(Submission submission, List<JudgeScore> judgeScores, Integer publishStage) {
        if (submission == null) return null;

        // 1. Kiểm tra nộp muộn (Deadline)
        boolean checkLate = false;
        if (submission.getRound() != null && submission.getRound().getSubmissionDeadline() != null) {
            checkLate = submission.getSubmittedAt().isAfter(submission.getRound().getSubmissionDeadline());
        }

        // Khởi tạo các giá trị mặc định liên quan đến điểm số là null hoặc rỗng
        Double avgScore = null;
        List<String> allComments = List.of();
        int officialJudgesCount = 0;

        // 2. CHỈ xử lý điểm số và nhận xét KHI publishStage == 3 (Giai đoạn công bố điểm chính thức)
        if (publishStage != null && publishStage == 3) {

            // Lọc các bảng điểm đã SUBMITTED chính thức từ Hội đồng
            List<JudgeScore> officialScores = (judgeScores != null) ? judgeScores.stream()
                                                                      .filter(score -> score.getStatus() == JudgeScoreStatus.SUBMITTED)
                                                                      .toList() : List.of();

            // Tính toán điểm trung bình cộng (Làm tròn 2 chữ số thập phân)
            if (!officialScores.isEmpty()) {
                double sum = officialScores.stream().mapToDouble(JudgeScore::getTotalScore).sum();
                avgScore = Math.round((sum / officialScores.size()) * 100.0) / 100.0;
            }

            // Gom tất cả nhận xét không rỗng của các giám khảo
            allComments = officialScores.stream()
                    .map(JudgeScore::getComment)
                    .filter(comment -> comment != null && !comment.trim().isEmpty())
                    .collect(Collectors.toList());

            officialJudgesCount = officialScores.size();
        }

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

                // Đổ dữ liệu hội đồng vào DTO (sẽ là ẩn/mặc định nếu stage chưa phải là 3)
                .score(avgScore)
                .comments(allComments)
                .judgesCount(officialJudgesCount)
                .build();
    }
}