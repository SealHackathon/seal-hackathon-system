package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.enums.UserStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
//bang user xac nhan
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "password", nullable = false)
    private String password;
    @Column(name = "fullName")
    private String fullName;
    @Column(name = "email", nullable = false)
    private String email;
    @Column(name = "schoolName")
    private String schoolName;
    @Column(name = "active", nullable = false)
    private boolean active = false;
    @Column(name = "student_id")
    private String studentId;
    @Column(name = "avt_img")
    private String avtImg;

    @Column(name = "phoneNumber")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 255, nullable = false)
    private UserStatus status;


    @Column
    private String token; //verify code

    @Column
    private LocalDateTime expiredAt;

    //Role moi them User/Lecturer/Admin
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    public boolean isExpired() {
        if (expiredAt == null) return true;
        return LocalDateTime.now().isAfter(expiredAt);
    }

    public User() {
    }

    public User(String password, String email, boolean active, String token, LocalDateTime expiredAt) {
        this.password = password;
        this.email = email;
        this.active = active;
        this.token = token;
        this.expiredAt = expiredAt;
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                '}';
    }
}
