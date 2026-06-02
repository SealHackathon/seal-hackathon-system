package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.MemberRole;
import jakarta.persistence.*;

@Entity
public class Member {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Id
    private Long id ;
    @Column(name="email")
    private String email;
    @Column(name = "fullname " , nullable = false)
    private String fullname ;
    @Enumerated(EnumType.STRING)
    @Column(name = "Role " , nullable = false)
    private MemberRole role ;


    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setMemberID(long memberID) {
        this.memberID = memberID;
    }

    //true la dang o trong doi , false da roi di
    @Column(name = "Status" , nullable = false)
    private boolean status ;
     @Column(name = "TeamId" , nullable = false)
    private long teamId ;
      @Column(name = "MemberId",nullable = false)
    private long memberID ;
    @Column(name = "school",nullable = false)
     private String schoolName ;

    public Member() {
    }

    public void setTeamId(long teamId) {
        this.teamId = teamId;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public Member(MemberRole role, boolean status, long teamId, long memberID,String schoolName,String fullname,String email) {

        this.role = role;
        this.status = status;
        this.teamId = teamId;
        this.memberID = memberID;
        this.schoolName = schoolName;
        this.fullname = fullname;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public long getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public long getMemberID() {
        return memberID;
    }

    public void setMemberID(int memberID) {
        this.memberID = memberID;
    }



    @Override
    public String toString() {
        return "Member{" +
                "id=" + id +
                ", role=" + role +
                ", status=" + status +
                ", teamId=" + teamId +
                ", memberID=" + memberID +
                '}';
    }
}
