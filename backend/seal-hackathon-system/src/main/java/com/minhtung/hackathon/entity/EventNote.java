package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_notes")
@Getter
@Setter
@NoArgsConstructor
public class EventNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id; // Có ID riêng biệt làm khóa chính

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event; // Liên kết ngược về Event

    public EventNote(String title, String description, Event event) {
        this.title = title;
        this.description = description;
        this.event = event;
    }
}