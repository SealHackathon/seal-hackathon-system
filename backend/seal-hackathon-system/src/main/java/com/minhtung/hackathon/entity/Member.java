package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.JoinMethod;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import jakarta.persistence.*;
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
    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 255, nullable = false)
    private MemberStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "joinmethod", length = 255, nullable = false)
    private JoinMethod joinMethod;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team", nullable = false)
    private Team team;
    @ManyToOne
    @JoinColumn(name = "member")
    private User member;

    public Member() {
    }

    public Member(MemberRole role, MemberStatus status, Team team, User member,JoinMethod joinMethod) {
        this.role = role;
        this.status = status;
        this.team = team;
        this.member = member;
        this.joinMethod = joinMethod;
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
