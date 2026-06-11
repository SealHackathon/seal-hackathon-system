package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "criterion")
@Data
public class Criterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String des;

    private Float weight;

    @Column(name = "max_range")
    private Integer maxRange;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scoring_template_id", nullable = false)
    private ScoringTemplate scoringTemplate;

    public Criterion(String name, String des, Float weight, Integer maxRange, ScoringTemplate scoringTemplate) {
        this.name = name;
        this.des = des;
        this.weight = weight;
        this.maxRange = maxRange;
        this.scoringTemplate = scoringTemplate;
    }


}