package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.RoundTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoundTimelineRepository extends JpaRepository<RoundTimeline, Long> {

    void deleteByRoundId(Long roundId);

    // Lấy toàn bộ timeline của nhiều round trong 1 query duy nhất, tránh N+1
    List<RoundTimeline> findByRound_IdIn(List<Long> roundIds);
}