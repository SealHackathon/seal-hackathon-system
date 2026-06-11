package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Data

public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;


    @Column(name = "title", nullable = false, columnDefinition = "varchar(255)")
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "varchar(255)")
    private String content;

    @Column(name = "isBroadcast", nullable = false)
    private boolean isBroadcast;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;


    @Column(name = "createAt", nullable = false)
    private LocalDateTime createAt;

    @Column(name = "sendAt")
    private LocalDateTime sendAt;

    @Column(name = "isRead")
    private boolean isRead = false;


    public Notification(Long id, User user, Team team, String title, String content, boolean isBroadcast, NotificationType type, LocalDateTime createAt, LocalDateTime sendAt) {
        this.id = id;
        this.user = user;
        this.team = team;
        this.title = title;
        this.content = content;
        this.isBroadcast = isBroadcast;
        this.type = type;
        this.createAt = createAt;
        this.sendAt = sendAt;
    }
}
