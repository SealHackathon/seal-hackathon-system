package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "milestone")
@Data
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 255)
    private String milestoneName;

    private LocalDate dateStart;

    private LocalDate dateEnd;

    @Column(length = 255)
    private String des;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public Milestone() {
    }

    public Milestone(String milestoneName, LocalDate dateStart, LocalDate dateEnd) {
    }
}