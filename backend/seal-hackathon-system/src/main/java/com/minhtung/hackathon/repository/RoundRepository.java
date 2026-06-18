package com.minhtung.hackathon.repository;


import com.minhtung.hackathon.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;


@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    int countByEventId(long eventId);

    // lấy vòng gần nhất chưa kết thúc
    Optional<Round> findFirstByTimeEndAfterOrderByTimeEndAsc(LocalDateTime now);}
