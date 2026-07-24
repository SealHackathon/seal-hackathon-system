package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.HandleViolationRequestDto;
import com.minhtung.hackathon.service.SystemRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system-requests")
@RequiredArgsConstructor
public class SystemRequestController {

    private final SystemRequestService systemRequestService;

    // API Lấy danh sách báo cáo vi phạm
    @GetMapping("/violations")
    public ResponseEntity<?> getViolationRequests() {
        return ResponseEntity.ok(systemRequestService.getPendingViolations());
    }


    // API xử lý báo cáo vi phạm
    @PutMapping("/violations/{id}/handle")
    public ResponseEntity<Void> handleViolation(
            @PathVariable("id") Long requestId,
            @RequestBody HandleViolationRequestDto dto) {

        systemRequestService.handleViolation(requestId, dto);
        return ResponseEntity.ok().build(); // Trả 200 OK rỗng để FE không bị dính lỗi parse JSON
    }
}