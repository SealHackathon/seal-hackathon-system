package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestone")
@Data
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String milestoneName;

    private LocalDateTime dateStart;

    private LocalDateTime dateEnd;

    @Column(length = 255)
    private String des;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public Milestone() {
    }

    public Milestone(String milestoneName, LocalDateTime dateStart, LocalDateTime dateEnd) {
    }
}