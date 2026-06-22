package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackRepository  extends JpaRepository<Track, Long> {

//    Optional<Track> findByEventId(long eventId);

    List<Track> findByEventId(long eventId);
    void deleteByEventId(long eventId);
}
