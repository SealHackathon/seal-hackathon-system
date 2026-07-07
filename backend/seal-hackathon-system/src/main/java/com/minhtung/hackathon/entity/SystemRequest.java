package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_request")
@Data
public class SystemRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;          // Người gửi lời mời (coordinator)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;        // Người nhận (mentor/judge)

    private long referenceId;     // eventId, teamId, ...
    private long trackId;     // Thêm trường này (để null nếu không dùng)
    private long roundId;     // Thêm trường này (để null nếu không dùng)
    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;  // EVENT, TEAM, ...

    @Enumerated(EnumType.STRING)
    private RequestType type;     // MENTOR_INVITE, JUDGE_INVITE, ...

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, SENT, ACCEPTED, REJECTED

    private String message;

    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); this.updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum ReferenceType { EVENT, TEAM }
    public enum RequestType   { MENTOR_INVITE, JUDGE_INVITE }
    public enum RequestStatus { PENDING, SENT, ACCEPTED, REJECTED,WITHDRAW }
}