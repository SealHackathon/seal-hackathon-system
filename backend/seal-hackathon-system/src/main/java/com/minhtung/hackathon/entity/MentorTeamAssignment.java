package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "mentor_team_assignment")
@Data

public class MentorTeamAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mentor_assignment_id")
    private MentorAssignment mentorAssignment;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;


    public MentorTeamAssignment(MentorAssignment mentorAssignment, Team team) {
        this.mentorAssignment = mentorAssignment;
        this.team = team;
    }
}
