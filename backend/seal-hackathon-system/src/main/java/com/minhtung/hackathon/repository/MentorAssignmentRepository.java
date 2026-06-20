package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {
    List<MentorAssignment> findByTrackId(Long trackId);
    boolean existsByTrackIdAndUserId(Long trackId, Long userId);
}