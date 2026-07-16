package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.PrizeResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrizeResultRepository extends JpaRepository<PrizeResult, Long> {
    Optional<PrizeResult> findByPrize_Id(Long prizeId);
    List<PrizeResult> findByPrize_Event_Id(Long eventId);
}