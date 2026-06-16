package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserIdentityProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user ;
    private String cmnd ;
    private String hometown ;

    private String thuongtru ;
    private String diditsesion ;
    private String diditStatus ;
    @Column(columnDefinition = "TEXT")
    private String studentCardUrl ; // base url
    private String adminNote ;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String nationality;
    @Column(columnDefinition = "TEXT")
    private String face_image ;
    @Column(columnDefinition = "TEXT")
    private String cmndBack_image ;

    private String mssv ;
    private String school ;
}
