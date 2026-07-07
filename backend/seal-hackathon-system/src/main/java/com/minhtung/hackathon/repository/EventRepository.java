package com.minhtung.hackathon.repository;


import com.minhtung.hackathon.entity.Event;

import com.minhtung.hackathon.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findByStatus(EventStatus eventStatus);
}
