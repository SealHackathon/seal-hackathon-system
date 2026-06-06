package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.RequestStatus;
import com.minhtung.hackathon.enums.RequestType;
import jakarta.persistence.*;
import lombok.*;

@Entity

@Getter
@Setter
@NoArgsConstructor
@Table(name = "TeamRequest")
public class TeamRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 20, nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    @ManyToOne
    @JoinColumn(name = "sender",nullable = false)
    private User sender;
    @ManyToOne
    @JoinColumn(name = "receiver",nullable = false)
    private User receiver;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team",nullable = false)
    private Team team;
    //JOIN_REQUEST , INVATION ,  LEAVE_REQUEST, TEAM_SUBMISSION
    @Enumerated(EnumType.STRING)
    @Column(name = "Type", length = 255, nullable = false)
    private RequestType type;
    @Column(name = "message")
    private String message;


    public TeamRequest(RequestStatus status, User sender, User receiver, Team team, RequestType type, String message) {
        this.status = status;
        this.sender = sender;
        this.receiver = receiver;
        this.team = team;
        this.type = type;
        this.message = message;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
}
