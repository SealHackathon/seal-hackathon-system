package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

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

    @Column(columnDefinition = "TEXT")
    private String bio ;

    @Column(columnDefinition = "TEXT")
    private String cvLink;

    @Column(columnDefinition = "TEXT")
    private String avatar ;

//    private String positions ;
//    private String tags ;
//    private String topics ;
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String>  positions;

    // Thay đổi từ text[] sang jsonb
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, List<String>> techTags;


    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String>  topics;

}
