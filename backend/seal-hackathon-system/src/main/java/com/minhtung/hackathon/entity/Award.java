package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "awards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Award {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id") // Nếu giải thưởng chia theo Track
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id") // Có thể null nếu giải phụ chưa được gán cho đội nào
    private Team team;

    @Column(nullable = false)
    private String type; // "MAIN" hoặc "EXTENDED"

    @Column(name = "award_key") 
    private String awardKey; // "first", "second", "third" (cho MAIN) hoặc null (cho EXTENDED)

    private String label; // "Giải Nhất", "Giải Nhì" hoặc "Giải Sáng Tạo" (cho EXTENDED)

    private Double score; // Điểm số đạt được tại thời điểm trao giải (nếu có)
}