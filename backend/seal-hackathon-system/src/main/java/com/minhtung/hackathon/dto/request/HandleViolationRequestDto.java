package com.minhtung.hackathon.dto.request;

import com.minhtung.hackathon.entity.SystemRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HandleViolationRequestDto {

    @NotNull(message = "Trạng thái xử lý không được để trống")
    private SystemRequest.RequestStatus status; // Enum: ACCEPTED, CANCELLED,...

    private String handleMessage;
}