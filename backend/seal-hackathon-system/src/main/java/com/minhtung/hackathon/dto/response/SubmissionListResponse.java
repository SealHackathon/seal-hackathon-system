package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionListResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long roundId;
    private LocalDateTime sumbittedAt; // Giữ nguyên theo đặt tên hiện tại của bạn

    // --- Thông tin đội thi ---
    private String leaderName;
    private String leaderPosition;
    private Integer memberCount;
    private String categoryName;

    // --- Thông tin chấm điểm lấy từ JudgeScore ---
    private String scoringStatus;    // "unscored" | "draft" | "done"
    private Double finalScore;       // Điểm số trung bình hoặc điểm hiện tại
    private LocalDateTime scoredAt;

    // --- Trạng thái file đính kèm ---
    private AttachmentStatus submission;

    @Data
    @Builder
    public static class AttachmentStatus {
        private boolean github;
        private boolean video; // Map từ demoUrl
        private boolean slide; // Map từ documentUrl
    }
}