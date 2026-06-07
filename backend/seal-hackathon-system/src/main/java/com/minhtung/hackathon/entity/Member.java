package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.MemberRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Member {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(name = "Role ", nullable = false)
    private MemberRole role;
    //true la dang o trong doi , false da roi di
    @Column(name = "Status", nullable = false)
    private boolean status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team", nullable = false)
    private Team team;
    @ManyToOne
    @JoinColumn(name = "member")
    private User member;
    public Member() {
    }

    public Member(MemberRole role, boolean status, Team team, User member) {
        this.role = role;
        this.status = status;
        this.team = team;
        this.member = member;
    }

    public User getMember() {
        return member;
    }

    public void setMember(User member) {
        this.member = member;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
}
