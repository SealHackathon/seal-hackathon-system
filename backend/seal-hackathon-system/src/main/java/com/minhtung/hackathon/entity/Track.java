package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "track")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_published", nullable = false)
    private boolean publishedResult = false; //TODO về sau có thể là 3 status CHUA CONG BO - CONG BO CHO JUDGE - CONG BO CHO SINH VIEN

    @Column(length = 255)
    private String des;

    @Column(name = "min_team_per_track")
    private int minTeamPerTrack;

    @Column(name = "max_team_per_track")
    private int maxTeamPerTrack;

    @OneToMany(mappedBy = "track")
    private List<Team> teams;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;


    public int getTeamQuantity() {
        if (teams == null) {
            return 0;
        }
        return teams.size();
    }

    public Track(String name, String des, int maxTeamPerTrack, int minTeamPerTrack) {
        this.name = name;
        this.des = des;
        this.maxTeamPerTrack = maxTeamPerTrack;
        this.minTeamPerTrack = minTeamPerTrack;
    }
}