package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "criterion")
@Data
@NoArgsConstructor
public class Criterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition =  "TEXT")
    private String description;

    private float weight;

    @Column(name = "max_range")
    private int maxRange;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scoring_template_id", nullable = false)
    private ScoringTemplate scoringTemplate;

    public Criterion(String name, String des, float weight,  ScoringTemplate scoringTemplate) {
        this.name = name;
        this.description = des;
        this.weight = weight;
        this.scoringTemplate = scoringTemplate;
    }


}