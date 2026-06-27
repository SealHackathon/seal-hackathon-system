package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Prize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, Long> {
    // Lấy danh sách giải thưởng của một sự kiện cụ thể
    List<Prize> findByEventId(long eventId);
}