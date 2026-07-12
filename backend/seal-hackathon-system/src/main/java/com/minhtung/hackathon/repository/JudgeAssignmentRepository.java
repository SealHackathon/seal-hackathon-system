package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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


    Optional<JudgeAssignment> findByUser_IdAndTrackIdAndRoundId(Long userId, Long trackId, Long roundId);

    Optional<JudgeAssignment> findByUser_IdAndRoundId(Long userId, Long roundId);

    boolean existsByUser_IdAndRoundId(Long userId, long roundId);

    List<JudgeAssignment> findByRound_Id(long roundId);

    List<JudgeAssignment> findByUserId(Long userId);

    // Fetch join Round + Track + Event để tránh N+1 khi build JudgeRoundDTO
    // (Track dùng LEFT JOIN vì có thể null - nghĩa là chấm toàn bộ track của round)
    @Query("SELECT ja FROM JudgeAssignment ja " +
            "JOIN FETCH ja.round r " +
            "LEFT JOIN FETCH ja.track t " +
            "JOIN FETCH ja.event e " +
            "WHERE ja.user.id = :userId")
    List<JudgeAssignment> findAllByUserIdWithDetails(@Param("userId") long userId);

}