package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prize_result", uniqueConstraints = {
    @UniqueConstraint(columnNames = "prize_id") // 1 giải chỉ có tối đa 1 đội được gán
})
@Data
public class PrizeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prize_id", nullable = false, unique = true)
    private Prize prize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    public PrizeResult() {
    }

    public PrizeResult(Prize prize, Team team) {
        this.prize = prize;
        this.team = team;
    }
}