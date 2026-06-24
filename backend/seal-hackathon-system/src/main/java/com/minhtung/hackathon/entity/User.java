package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    @Column(name = "Active", nullable = false) // la xác nhận rằng đã được login hay chưa l
    private boolean active = false;
    @Column(columnDefinition = "TEXT")
    private String avt_img ;

    @Column(name = "phoneNumber" ,unique = true )
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 255, nullable = false)
    private UserStatus status;
    //Role moi them User/Lecturer/Admin
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    public UserStatus getStatus() {
        return status;
    } // trang thai ho so va quyen tham gia
    @Column
    private String token; //verify code
    @ManyToOne
    @JoinColumn(name = "university_id")
    private University university;

    @Column
    private String studentId ;
    @Column
    private LocalDateTime expiredAt;
    public void setStatus(UserStatus status) {
        this.status = status;
    }

    @Column
    private String title;  // "Giảng viên AI", "Senior Engineer", ...

    @Column
    private String org;    // "FPT University", "Viettel Cyber", ...

    public boolean isExpired() {
        if (expiredAt == null) return true;
        return LocalDateTime.now().isAfter(expiredAt);
    }

    @Column(name = "last_verification_email_sent_at")
    private LocalDateTime lastVerificationEmailSentAt;

    @Column(name = "resend_email_count")
    private Integer resendEmailCount = 0;

    @Column(name = "resend_email_count_date")
    private LocalDate resendEmailCountDate;





}
