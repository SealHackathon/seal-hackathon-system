package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "mentor_assignment")
@Data
public class MentorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User user;

    public MentorAssignment(long id, Track track, User user) {
        this.id = id;
        this.track = track;
        this.user = user;
    }
}