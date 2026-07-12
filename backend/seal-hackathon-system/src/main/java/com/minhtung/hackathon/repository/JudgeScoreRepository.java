package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.JudgeScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JudgeScoreRepository extends JpaRepository<JudgeScore,Long> {

    boolean existsByJudgeAssignmentIdAndSubmissionId(Long judgeAssignmentId , Long submissionId) ;
    List<JudgeScore>
    findByJudgeAssignmentUserIdOrderBySubmitAtDesc(
            Long userId
    );

    // Lấy điểm số của bản ghi bài nộp cụ thể

    List<JudgeScore> findBySubmissionId(Long submissionId);

    Optional<JudgeScore> findByJudgeAssignmentIdAndSubmissionId(Long assignmentId, Long submissionId);

    @Query("""
        SELECT DISTINCT js FROM JudgeScore js
        LEFT JOIN FETCH js.details d
        LEFT JOIN FETCH d.criterion
        WHERE js.submission.round.id = :roundId
    """)
    List<JudgeScore> findAllByRoundIdWithDetails(@Param("roundId") long roundId);

}
