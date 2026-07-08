package com.minhtung.hackathon.repository;


import com.minhtung.hackathon.entity.Event;

import com.minhtung.hackathon.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findByStatus(EventStatus eventStatus);


    // Chỉ fetch Round (1 bag), không fetch thêm roundTimelines để tránh MultipleBagFetchException
    @Query("SELECT DISTINCT e FROM Event e " +
            "LEFT JOIN FETCH e.rounds r " +
            "WHERE e.id = :eventId")
    Optional<Event> findByIdWithRounds(@Param("eventId") Long eventId);
}
