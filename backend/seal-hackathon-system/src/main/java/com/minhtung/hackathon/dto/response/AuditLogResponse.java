package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private long id;
    private String type;     // score_submitted, score_edited, flagged
    private String user;     // Tên kèm chức danh/học vị hoặc full_name
    private String action;   // "đã hoàn thành chấm điểm", "đã chỉnh sửa điểm", ...
    private String target;   // Tên đội thi hoặc target bị tác động
    private LocalDateTime time;
    private String detail;   // Thông tin chi tiết (ví dụ: "Tổng: 8.0")
}