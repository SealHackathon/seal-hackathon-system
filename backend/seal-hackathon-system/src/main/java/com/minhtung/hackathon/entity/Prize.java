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

    @Column(columnDefinition = "TEXT")
    private String description;

    private int money;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prizeName;

    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public Prize() {
    }

    public Prize(String description, int money, String prizeName, Event event,int quantity) {
        this.description = description;
        this.money = money;
        this.prizeName = prizeName;
        this.event = event;
        this.quantity = quantity;
    }

    public Prize(String description, int money, String prizeName,int quantity, Event event) {
        this.description = description;
        this.money = money;
        this.prizeName = prizeName;
        this.quantity = quantity;
        this.event = event;

    }
}