package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

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

    @Column(name = "min_team_per_track")
    private int minTeamPerTrack;

    @Column(name = "max_team_per_track")
    private int maxTeamPerTrack;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @OneToMany(mappedBy = "track")
    private List<Team> teams;

    public Track(String name, String des, int maxTeamPerTrack, int minTeamPerTrack, Round round) {
        this.name = name;
        this.des = des;
        this.maxTeamPerTrack = maxTeamPerTrack;
        this.minTeamPerTrack = minTeamPerTrack;
        this.round = round;
    }
}