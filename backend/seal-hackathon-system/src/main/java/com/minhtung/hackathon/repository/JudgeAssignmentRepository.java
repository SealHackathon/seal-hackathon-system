package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Long> {
    // Lấy danh sách phân công của một nhánh đấu cụ thể
    List<JudgeAssignment> findByTrackId(long trackId);
    
    // Kiểm tra xem giám khảo đã được phân công vào nhánh đấu này chưa (tránh trùng lặp)
    boolean existsByTrackIdAndUserId(long trackId, long userId);

    void deleteByEventId(Long eventId);


    Optional<JudgeAssignment> findByUser_IdAndTrackId(Long userId, Long trackId);

}