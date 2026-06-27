package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.AuditAction;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên entity bị tác động
     * Ví dụ:
     * Team
     * Submission
     * JudgeScore
     * TeamRound
     */
    @Column(nullable = false)
    private String entityType;

    /**
     * Id của entity bị tác động
     */
    @Column(nullable = false)
    private Long entityId;

    /**
     * CREATE, UPDATE, DELETE, APPROVE, REJECT,...
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    /**
     * Tên field thay đổi
     * Ví dụ: score, status, githubUrl
     */
    private String fieldName;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column
    private LocalDateTime performedAt;
}