package com.minhtung.hackathon.repository;


import com.minhtung.hackathon.entity.Round;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    int countByEventId(long eventId);

    boolean existsByEventId(long eventId);
    void deleteByEventId(long eventId);

    // lấy vòng gần nhất chưa kết thúc
    Optional<Round> findFirstByTimeEndAfterOrderByTimeEndAsc(LocalDateTime now);

    // Sử dụng LEFT JOIN FETCH để kéo dữ liệu LAZY của submissionConfig về cùng một lúc
    @Query("SELECT r FROM Round r LEFT JOIN FETCH r.submissionConfig WHERE r.event.id = :eventId")
    List<Round> findRoundsWithConfigByEventId(@Param("eventId") Long eventId);

}
