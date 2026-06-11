package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "track")
@Data
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String des;

    @Column(name = "max_team_per_track")
    private int maxTeamPerTrack;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    public Track(String name, String des, int maxTeamPerTrack, Round round) {
        this.name = name;
        this.des = des;
        this.maxTeamPerTrack = maxTeamPerTrack;
        this.round = round;
    }
}