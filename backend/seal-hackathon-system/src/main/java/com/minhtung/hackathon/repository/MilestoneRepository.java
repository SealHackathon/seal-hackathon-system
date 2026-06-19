package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    // Lấy danh sách mốc thời gian của một sự kiện cụ thể
    List<Milestone> findByEventId(Long eventId);
}