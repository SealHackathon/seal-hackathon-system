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
    @JoinColumn(name = "track_id")
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public MentorAssignment( Track track, User user) {
        this.track = track;
        this.user = user;
    }
}