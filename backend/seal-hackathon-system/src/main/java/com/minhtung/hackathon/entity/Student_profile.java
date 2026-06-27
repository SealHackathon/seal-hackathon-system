package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student_profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user ;
    @Column(columnDefinition = "TEXT")
    private String  img_studentcard ;

    private String bio ;


    private String positions ;
    private String tags ;
    private String topics ;
//    @JdbcTypeCode(SqlTypes.ARRAY)
//    @Column(columnDefinition = "text[]")
//    private String[] positions;
//
//    @JdbcTypeCode(SqlTypes.ARRAY)
//    @Column(columnDefinition = "text[]")
//    private String[] tags;
//
//
//    @JdbcTypeCode(SqlTypes.ARRAY)
//    @Column(columnDefinition = "text[]")
//    private String[] interestArea;

}
