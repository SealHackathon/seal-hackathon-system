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
import com.minhtung.hackathon.repository.SubmissionRepository;
import com.minhtung.hackathon.repository.UserRepository;
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
    private final SubmissionRepository submissionRepository;
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

        long violationsFlagged = auditLogRepository.countByAction(AuditAction.FLAGGED);

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
        // 1. Tên người thực hiện (ThS. Nguyễn Văn A / Hệ thống)
        String userDisplay = "Hệ thống";
        if (log.getPerformedBy() != null) {
            userDisplay = log.getPerformedBy().getFullName();
            if (log.getPerformedBy().getTitle() != null && !log.getPerformedBy().getTitle().isBlank()) {
                userDisplay = log.getPerformedBy().getTitle() + " " + userDisplay;
            }
        }

        String type;
        String actionText;
        String targetText = "N/A";

        // 2. Map type & actionText
        if (log.getAction() == AuditAction.SCORE_SUBMITTED) {
            type = "score_submitted";
            actionText = "đã hoàn thành chấm điểm";
        } else if (log.getAction() == AuditAction.SCORE_EDITED) {
            type = "score_edited";
            actionText = "đã yêu cầu chỉnh sửa điểm";
        } else if (log.getAction() == AuditAction.FLAGGED) {
            type = "flagged";
            actionText = "gắn cờ vi phạm";
        } else {
            type = log.getAction().name().toLowerCase();
            actionText = "đã thực hiện thao tác";
        }

        // 3. Map targetText linh hoạt theo EntityType
        if (log.getEntityId() != null) {
            if ("JudgeScore".equalsIgnoreCase(log.getEntityType())) {
                // Trường hợp chấm/sửa điểm: Entity là JudgeScore -> Submission -> Team
                targetText = judgeScoreRepository.findById(log.getEntityId())
                        .map(js -> "đội " + js.getSubmission().getTeam().getName())
                        .orElse("Hệ thống");

            } else if ("Submission".equalsIgnoreCase(log.getEntityType())) {
                // Trường hợp báo cờ vi phạm: Entity trực tiếp là Submission -> Team
                targetText = submissionRepository.findById(log.getEntityId())
                        .map(sub -> "đội " + sub.getTeam().getName())
                        .orElse("Hệ thống");
            }
        }

        return AuditLogResponse.builder()
                .id(log.getId())
                .type(type)
                .user(userDisplay)
                .action(actionText)
                .target(targetText)
                .time(log.getPerformedAt())
                .detail(log.getNewValue())
                .build();
    }
}