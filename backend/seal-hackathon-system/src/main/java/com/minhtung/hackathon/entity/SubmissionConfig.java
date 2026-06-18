package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission_config")
@NoArgsConstructor
@Getter
@Setter
public class SubmissionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id")
    private Round round;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    // Sử dụng kiểu COLUMN_DEFINITION TEXT để lưu hướng dẫn dài
    @Column(name = "submission_instructions", columnDefinition = "TEXT")
    private String submissionInstructions;

    @Column(name = "opening_time", nullable = false)
    private LocalDateTime openingTime;

    @Column(name = "submission_deadline", nullable = false)
    private LocalDateTime submissionDeadline;

    public SubmissionConfig(Round round, String title, LocalDateTime openingTime, LocalDateTime submissionDeadline, String submissionInstructions) {
        this.round = round;
        this.title = title;
        this.openingTime = openingTime;
        this.submissionDeadline = submissionDeadline;
        this.submissionInstructions = submissionInstructions;
    }
}