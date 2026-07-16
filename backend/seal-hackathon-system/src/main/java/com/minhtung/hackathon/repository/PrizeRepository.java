package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.enums.PrizeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, Long> {
    // Lấy danh sách giải thưởng của một sự kiện cụ thể
    List<Prize> findByEventId(long eventId);

    void deleteByEventId(long eventId);

    List<Prize> findByEvent_IdAndPrizeType(Long eventId, PrizeType prizeType);

}