package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.service.SystemRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}