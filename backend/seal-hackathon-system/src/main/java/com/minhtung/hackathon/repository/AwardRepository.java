package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Award;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwardRepository extends JpaRepository<Award, Long> {
    // Tìm tất cả giải thưởng thuộc Round, có thể lọc theo Track nếu cần
    List<Award> findByRound_Id(Long roundId);
    List<Award> findByRound_IdAndTrack_Id(Long roundId, Long trackId);
}