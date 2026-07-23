package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class FlagViolationRequest {
    private Boolean isViolation; // true: tạo báo cáo, false: hủy báo cáo
    private String reason;      // Lý do vi phạm
}