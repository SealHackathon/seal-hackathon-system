package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "round")
@Data
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    private LocalDateTime timeStart;

    private LocalDateTime timeEnd;

    private boolean hasSubmission;

    private int topTeamPass;

    private LocalDateTime submissionDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scoring_template_id")
    private ScoringTemplate scoringTemplate;

    @OneToMany(mappedBy = "round",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Track> tracks = new ArrayList<>();


    public Round() {
    }

    public Round(String name, LocalDateTime timeStart, LocalDateTime timeEnd, boolean hasSubmission, int topTeamPass, LocalDateTime submissionDeadline, Event event, ScoringTemplate scoringTemplate) {
        this.name = name;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.hasSubmission = hasSubmission;
        this.topTeamPass = topTeamPass;
        this.submissionDeadline = submissionDeadline;
        this.event = event;
        this.scoringTemplate = scoringTemplate;
    }
}