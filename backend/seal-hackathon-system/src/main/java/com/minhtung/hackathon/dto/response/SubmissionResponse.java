package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.entity.Submission;
import com.minhtung.hackathon.entity.JudgeScore;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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

    // Các trường phục vụ hiển thị cột phải dữ liệu thật
    private Double score;         // Lấy từ judgeScore.totalScore
    private String comment;       // Lấy từ judgeScore.comment
    private Boolean isLate;       // Tự động tính toán dựa trên deadline
    private LocalDateTime lastEditedAt;

    public static SubmissionResponse from(Submission submission, JudgeScore judgeScore) {
        // Kiểm tra xem thời gian nộp bài có vượt quá hạn nộp của vòng thi (deadline) không
        boolean checkLate = false;
        if (submission.getRound() != null && submission.getRound().getSubmissionDeadline() != null) {
            checkLate = submission.getSubmittedAt().isAfter(submission.getRound().getSubmissionDeadline());
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
                .lastEditedAt(submission.getSubmittedAt()) // Nếu có lưu trường updatedAt ở bài nộp thì truyền vào đây

                // Điền dữ liệu thật từ bảng judge_score vào đây (nếu đã chấm)
                .score(judgeScore != null ? judgeScore.getTotalScore() : null)
                .comment(judgeScore != null ? judgeScore.getComment() : null)
                .build();
    }
}