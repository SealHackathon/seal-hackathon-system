package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.TeamResultStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_result")
@Data
public class TeamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(name = "total_score")
    private double totalScore;

    @Enumerated(EnumType.STRING)
    private TeamResultStatus status;

    /**
     * Thứ hạng trong vòng thi
     * Ví dụ: 1, 2, 3,...
     */
    @Column(name = "ranking")
    private int ranking;

    @Column(name = "is_passed")
    private boolean isPassed;
}