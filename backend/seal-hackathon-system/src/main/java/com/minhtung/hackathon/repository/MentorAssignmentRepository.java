package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {
    List<MentorAssignment> findByTrackId(Long trackId);
    boolean existsByTrackIdAndUserId(Long trackId, Long userId);

    void deleteByEventId(Long eventId);

    List<MentorAssignment> findByUserId(Long userId);

    @Query("SELECT ma FROM MentorAssignment ma " +
            "JOIN FETCH ma.track t " +
            "JOIN FETCH ma.event e " +
            "WHERE ma.user.id = :userId")
    List<MentorAssignment> findAllByUserIdWithDetails(@Param("userId") long userId);

}