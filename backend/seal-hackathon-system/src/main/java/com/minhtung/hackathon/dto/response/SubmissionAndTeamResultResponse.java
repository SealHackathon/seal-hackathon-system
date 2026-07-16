package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SubmissionAndTeamResultResponse {
    private Long id;
    private String githubUrl;
    private String demoUrl;
    private String documentUrl;
    private LocalDateTime submittedAt;
    private LocalDateTime lastEditedAt; // Có thể map trùng submittedAt nếu bạn không quản lý cập nhật riêng
    private boolean isLate;

    // Điểm trung bình cộng lấy từ TeamResult
    private Double score;

    // Đếm số lượng giám khảo đã SUBMITTED điểm
    private int judgesCount;

    // Danh sách nhận xét từ hội đồng giám khảo
    private List<String> comments;
}
