package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    // Tìm kiếm bản ghi dựa vào userId và eventId để check trùng
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}