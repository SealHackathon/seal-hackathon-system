package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scoring_template")
@Data
public class ScoringTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column
    private LocalDateTime createAt;

    @OneToMany(mappedBy = "scoringTemplate",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Criterion> criteria = new ArrayList<>();

    @OneToMany(mappedBy = "scoringTemplate")
    private List<Round> rounds = new ArrayList<>();

    public ScoringTemplate() {
    }

    public ScoringTemplate(String name, String description, LocalDateTime createAt) {
        this.name = name;
        this.description = description;
        this.createAt = createAt;
    }
}