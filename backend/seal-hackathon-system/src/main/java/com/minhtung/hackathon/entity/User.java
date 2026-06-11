package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")

//bang user xac nhan
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "Password", nullable = false)
    private String password;
    @Column(name = "fullName")
    private String fullName;
    @Column(name = "Email", nullable = false)
    private String email;
    @Column(name = "schoolName")
    private String schoolName;
    @Column(name = "Active", nullable = false)
    private boolean active = false;

    @Column(name = "studentCardImg")
    private String studentCardImg;

    @Column(name = "studentImg", columnDefinition = "varchar(255)")
    private String studentImg;

    @Column(name = "bio", columnDefinition = "varchar(11)")
    private String bio;

    @Column(name = "phoneNumber")
    private String phoneNumber;


    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    @Column
    private String token; //verify code

    @Column
    private LocalDateTime expiredAt;

    //Role moi them User/Lecturer/Admin
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

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

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(LocalDateTime expiredAt) {
        this.expiredAt = expiredAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
