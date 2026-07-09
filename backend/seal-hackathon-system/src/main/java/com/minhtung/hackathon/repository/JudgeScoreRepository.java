package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.JudgeScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JudgeScoreRepository extends JpaRepository<JudgeScore,Long> {

    boolean existsByJudgeAssignmentIdAndSubmissionId(Long judgeAssignmentId , Long submissionId) ;
    List<JudgeScore>
    findByJudgeAssignmentUserIdOrderBySubmitAtDesc(
            Long userId
    );

    // Lấy điểm số của bản ghi bài nộp cụ thể
    Optional<JudgeScore> findBySubmissionId(Long submissionId);

    Optional<JudgeScore> findByJudgeAssignmentIdAndSubmissionId(Long assignmentId, Long submissionId);
}
