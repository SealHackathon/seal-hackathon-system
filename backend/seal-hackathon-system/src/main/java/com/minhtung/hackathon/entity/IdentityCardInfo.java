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
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "identity_id", nullable = false, unique = true)
    private String identityId;

    @Column(nullable = false)
    private String sex;

    @Column(nullable = false, name = "date_of_birth")
    private LocalDate dateOfBirth;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

}
