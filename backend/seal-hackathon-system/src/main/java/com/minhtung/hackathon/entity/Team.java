package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.TeamStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
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

    @OneToOne
    @JoinColumn (name = "leader",nullable = false )
    private  User leader ;
    @OneToMany(mappedBy = "team")
    private List<Member> members;
    @OneToMany(mappedBy = "team")
    private List<TeamRequest> teamRequest;
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

    public Team(String name, TeamStatus status, LocalDate createAt, User leader, String inviteCode, String description) {
        this.name = name;
        this.status = status;
        this.createAt = createAt;
        this.leader = leader;
        this.inviteCode = inviteCode;
        this.description = description;
    }

    public List<Member> getMembers() {
        return members;
    }

    public void setMembers(List<Member> members) {
        this.members = members;
    }

    public User getLeader() {
        return leader;
    }

    public void setLeader(User leader) {
        this.leader = leader;
    }
}
