package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.JudgeScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JudgeScoreRepository extends JpaRepository<JudgeScore,Long> {

    boolean existsByJudgeAssignmentIdAndSubmissionId(Long judgeAssignmentId , Long submissionId) ;
    List<JudgeScore>
    findByJudgeAssignmentUserIdOrderBySubmitAtDesc(
            Long userId
    );
}
