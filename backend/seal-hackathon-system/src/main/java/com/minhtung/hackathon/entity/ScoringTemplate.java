package com.minhtung.hackathon.entity;

import com.minhtung.hackathon.enums.ScoringTemplateStatus;
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
    private long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column( columnDefinition = "TEXT")
    private String description;

    @Column( columnDefinition = "TEXT")
    private String url;
    @Column
    private LocalDateTime createAt;

    @Column
    private LocalDateTime updateAt;

    @Column
    private int usageCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ScoringTemplateStatus status;

    @Column(name = "is_tie_breaking")
    private boolean isTieBreaking; // Thêm trường tiêu chí phụ

    @Column(name = "standard_deviation")
    private double standardDeviation; // Thêm trường độ lệch chuẩn

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


    public void addCriterion(Criterion criterion) {
        this.criteria.add(criterion);
        criterion.setScoringTemplate(this);
    }


}