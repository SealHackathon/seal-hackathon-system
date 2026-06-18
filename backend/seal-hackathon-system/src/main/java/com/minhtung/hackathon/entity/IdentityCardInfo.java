package com.minhtung.hackathon.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "identity_card_info")
@Data

public class IdentityCardInfo {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "identity_id", nullable = false, unique = true)
    private String identityId;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false, name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(nullable = false, name = "address", columnDefinition = "TEXT")
    private String address;


    @Column(nullable = false, name = "id_img_front", columnDefinition = "TEXT")
    private String idImgFront;

    @Column(nullable = false, name = "id_img_back", columnDefinition = "TEXT")
    private String idImgBack;

    @Column(nullable = false, name = "face_img", columnDefinition = "TEXT")
    private String faceImg;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

}
