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
   ;
     private  Boolean faceMatched = false ;

    private Integer faceMatchAttempts = 0;

    private Boolean needsManualFaceReview = false;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String Adminnote ;

    @Column(columnDefinition = "TEXT")
    private String face_image ; // anh cat ra tu cccd
    @Column(columnDefinition = "TEXT")
    private String cmndBack_image ;
    @Column(columnDefinition = "TEXT")
    private String frontcmnd_img ;
    @Column(columnDefinition = "TEXT")
    private String selfieImage ;
    @Column(columnDefinition = "TEXT")
    private String qrRaw ;


}
