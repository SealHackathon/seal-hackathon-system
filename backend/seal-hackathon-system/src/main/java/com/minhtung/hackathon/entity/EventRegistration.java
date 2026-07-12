package com.minhtung.hackathon.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
@Data
@NoArgsConstructor
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt = LocalDateTime.now();

    // Bạn có thể thêm enum Status để quản lý trạng thái đăng ký tại đây
    // @Enumerated(EnumType.STRING)
    // private RegistrationStatus status; 
}