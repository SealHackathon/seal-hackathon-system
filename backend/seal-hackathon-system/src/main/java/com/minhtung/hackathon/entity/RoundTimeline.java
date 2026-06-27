package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "round_timeline")
@NoArgsConstructor
@Getter
@Setter
public class RoundTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "time_start")
    private String timeStart;  // ← đổi từ LocalDateTime sang String

    @Column(name = "time_end")
    private String timeEnd;    // ← đổi từ LocalDateTime sang String

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    public RoundTimeline(String name, String description, String timeStart, String timeEnd, Round round) {
        this.name = name;
        this.description = description;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.round = round;
    }
}