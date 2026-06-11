package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prize")
@Data
public class Prize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(length = 255)
    private String description;

    private int money;

    @Column(nullable = false, length = 255)
    private String prizeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public Prize() {
    }

    public Prize(String description, int money, String prizeName, Event event) {
        this.description = description;
        this.money = money;
        this.prizeName = prizeName;
        this.event = event;

    }
}