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

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;
    private boolean isPublishedResult = false; //TODO về sau có thể là 3 status CHUA CONG BO - CONG BO CHO JUDGE - CONG BO CHO SINH VIEN
    private LocalDateTime timeStart;
    @Column(columnDefinition = "TEXT")
    private String meetingLink;
    private LocalDateTime timeEnd;

    private boolean hasPresetiontation;

    private int topTeamPass;

    private int ordinal_number;

    private LocalDateTime submissionDeadline;

    @Column(columnDefinition = "TEXT")
    private String position;

    @Column(columnDefinition = "TEXT")
    private String locationName;

    @Column(columnDefinition = "TEXT")
    private String detailLocation;

    @OneToMany(mappedBy = "round",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Submission> submissions = new ArrayList<>();

    @OneToMany(mappedBy = "round",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<RoundTimeline> roundTimelines = new ArrayList<>();

    // Thay đổi từ @JoinColumn sang mappedBy
    @OneToOne(mappedBy = "round", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private SubmissionConfig submissionConfig;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scoring_template_id")
    private ScoringTemplate scoringTemplate;


    public Round() {
    }

    public Round(String name, LocalDateTime timeStart, LocalDateTime timeEnd,  int topTeamPass, LocalDateTime submissionDeadline, Event event, ScoringTemplate scoringTemplate, int ordinal_number) {
        this.name = name;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.topTeamPass = topTeamPass;
        this.submissionDeadline = submissionDeadline;
        this.event = event;
        this.scoringTemplate = scoringTemplate;
        this.ordinal_number = ordinal_number;
    }
}