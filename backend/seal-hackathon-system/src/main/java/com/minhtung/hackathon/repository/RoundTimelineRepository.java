package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.RoundTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundTimelineRepository extends JpaRepository<RoundTimeline, Long> {
}