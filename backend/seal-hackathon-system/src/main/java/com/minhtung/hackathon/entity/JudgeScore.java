package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "judge_score")
@Data
public class JudgeScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_assignment_id", nullable = false)
    private JudgeAssignment judgeAssignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false)
    private LocalDateTime submitAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}