package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.AuditLogOverviewResponse;
import com.minhtung.hackathon.dto.response.AuditLogResponse;
import com.minhtung.hackathon.dto.response.PageMetaResponse;
import com.minhtung.hackathon.dto.response.PageResponse;
import com.minhtung.hackathon.entity.AuditLog;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.AuditAction;
import com.minhtung.hackathon.repository.AuditLogRepository;
import com.minhtung.hackathon.repository.JudgeScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final JudgeScoreRepository judgeScoreRepository;
    public void log(
            String entityType,
            Long entityId,
            AuditAction action,
            String fieldName,
            String oldValue,
            String newValue,
            User performedBy
    ) {
        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setAction(action);
        auditLog.setFieldName(fieldName);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setPerformedBy(performedBy);
        auditLog.setPerformedAt(LocalDateTime.now());

        auditLogRepository.save(auditLog);
    }




    /**
     *  Lấy thông tin thống kê Overview
     */
    public AuditLogOverviewResponse getOverview() {
        long totalActions = auditLogRepository.count();
        long scoreSubmissions = auditLogRepository.countByAction(AuditAction.SCORE_SUBMITTED);
        long scoreEdits = auditLogRepository.countByAction(AuditAction.SCORE_EDITED);

        // Giả định nếu bạn có enum FLAGGED cho vi phạm, nếu chưa có thì để tạm 0 hoặc đếm theo enum tương ứng
        long violationsFlagged = 0;

        return AuditLogOverviewResponse.builder()
                .totalActions(totalActions)
                .scoreSubmissions(scoreSubmissions)
                .scoreEdits(scoreEdits)
                .violationsFlagged(violationsFlagged)
                .build();
    }

    /**
     *  Lấy danh sách nhật ký thao tác (Phân trang)
     */
    public PageResponse<AuditLogResponse> getAuditLogs(int page, int limit) {
        // Page trong Spring Data bắt đầu từ 0
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<AuditLog> logPage = auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);

        List<AuditLogResponse> logResponses = logPage.getContent().stream()
                .map(this::mapToAuditLogResponse)
                .toList();

        PageMetaResponse meta = PageMetaResponse.builder()
                .currentPage(page)
                .totalPages(logPage.getTotalPages())
                .totalRecords(logPage.getTotalElements())
                .limit(limit)
                .build();

        return PageResponse.<AuditLogResponse>builder()
                .meta(meta)
                .data(logResponses)
                .build();
    }

    private AuditLogResponse mapToAuditLogResponse(AuditLog log) {
        String userDisplay = log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "Hệ thống";
        if (log.getPerformedBy() != null && log.getPerformedBy().getTitle() != null) {
            userDisplay = log.getPerformedBy().getTitle() + " " + userDisplay;
        }

        String type;
        String actionText;
        String targetText = "N/A";

        // Map enum sang định dạng Frontend yêu cầu
        if (log.getAction() == AuditAction.SCORE_SUBMITTED) {
            type = "score_submitted";
            actionText = "đã hoàn thành chấm điểm";
        } else if (log.getAction() == AuditAction.SCORE_EDITED) {
            type = "score_edited";
            actionText = "đã yêu cầu chỉnh sửa điểm";
        } else {
            type = log.getAction().name().toLowerCase();
            actionText = "đã thực hiện thao tác";
        }

        // Truy vấn lấy tên Đội thi dựa trên entityId (JudgeScore -> Submission -> Team)
        if ("JudgeScore".equalsIgnoreCase(log.getEntityType()) && log.getEntityId() != null) {
            targetText = judgeScoreRepository.findById(log.getEntityId())
                    .map(js -> "đội " + js.getSubmission().getTeam().getName())
                    .orElse("Hệ thống");
        }

        return AuditLogResponse.builder()
                .id("al" + log.getId())
                .type(type)
                .user(userDisplay)
                .action(actionText)
                .target(targetText)
                .time(log.getPerformedAt()) // Jackson sẽ tự render ra ISO 8601 (e.g. 2026-07-22T10:35:00)
                .detail(log.getNewValue())
                .build();
    }
}