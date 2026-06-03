package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.TeamStatus;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id ;


    @Column(name = "Name",nullable = false , length = 100)
    private String name ;

    @Column(name = "Status", length = 20 , nullable = false)
    private TeamStatus status = TeamStatus.OPEN;
    @Column(name = "CreateAt" , nullable = false )
    private LocalDate createAt = LocalDate.now() ;
    @Column(name = "LeaderId",length =  10 )
    private long leaderID ;
   @Column(name = "InviteCode",nullable = false,unique = true)
    private String inviteCode ;
   @Column(name = "TrackInt")
    private Integer trackint ;
   @Column(name = "Description")
    private String description ;
    @Column(name = "CompetitionStatus")

    private Integer competitionStatus ;



    public Team() {
    }

    public Team(String name, long leaderID, String inviteCode,String description) {
        this.name = name;
        this.leaderID = leaderID;
        this.inviteCode = inviteCode;
        this.description = description;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TeamStatus getStatus() {
        return status;
    }

    public void setStatus(TeamStatus status) {
        this.status = status;
    }

    public LocalDate getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDate createAt) {
        this.createAt = createAt;
    }

    public long getLeaderID() {
        return leaderID;
    }

    public void setLeaderID(long leaderID) {
        this.leaderID = leaderID;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public Integer getTrackint() {
        return trackint;
    }

    public void setTrackint(Integer trackint) {
        this.trackint = trackint;
    }

    public String getDescription() {
        return description;
    }

    public void setColum(String description) {
        this.description = description;
    }

    public Integer getCompetitionStatus() {
        return competitionStatus;
    }

    public void setCompetitionStatus(Integer competitionStatus) {
        this.competitionStatus = competitionStatus;
    }

    @Override
    public String toString() {
        return "Team{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", createAt=" + createAt +
                ", leaderID=" + leaderID +
                ", inviteCode='" + inviteCode + '\'' +
                ", trackint=" + trackint +
                ", colum=" + description +
                ", competitionStatus=" + competitionStatus +
                '}';
    }
}
