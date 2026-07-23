package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.response.AuditLogOverviewResponse;
import com.minhtung.hackathon.dto.response.AuditLogResponse;
import com.minhtung.hackathon.dto.response.PageResponse;
import com.minhtung.hackathon.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogQueryService;

    @GetMapping("/overview")
    public ResponseEntity<AuditLogOverviewResponse> getOverview() {
        return ResponseEntity.ok(auditLogQueryService.getOverview());
    }

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(auditLogQueryService.getAuditLogs(page, limit));
    }
}