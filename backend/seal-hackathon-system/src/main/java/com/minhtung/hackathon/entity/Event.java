package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private LocalDateTime createAt;

    //sau nay doi ve enum
    @Column(length = 255)
    private String description;

    @Column(length = 20)
    private String status;

    @Column
    private int minTeamMember;

    @Column(length = 255)
    private String topic;

    @Column(length = 255)
    private String bannerImg;

    @Column(length = 255)
    private String posterImg;

    @Column
    private int maxTeamMember;

    @Column(length = 255)
    private String rules;

    @Column(length = 255)
    private String participationBenefits;


    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Milestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Prize> prizes = new ArrayList<>();

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Round> rounds = new ArrayList<>();

    public Event() {
    }

    public Event(String name, LocalDateTime createAt, String description, String status, int minTeamMember, String topic, String bannerImg, String posterImg, int maxTeamMember, String rules, String participationBenefits) {
        this.name = name;
        this.createAt = createAt;
        this.description = description;
        this.status = status;
        this.minTeamMember = minTeamMember;
        this.topic = topic;
        this.bannerImg = bannerImg;
        this.posterImg = posterImg;
        this.maxTeamMember = maxTeamMember;
        this.rules = rules;
        this.participationBenefits = participationBenefits;
    }
}
