package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Submission; // Thay thế bằng entity thực tế của bạn
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // Lấy bài nộp dựa trên teamId và roundId
    Optional<Submission> findByTeamIdAndRoundId(Long teamId, Long roundId);
    Optional<Submission>
    findFirstByTeamIdAndRoundIdAndLatestTrue(
            Long teamId,
            Long roundId
    );
    List<Submission>
    findByRoundIdAndLatestTrueOrderBySubmittedAtDesc(
            Long roundId
    );
    List<Submission>
    findByTeamTrackIdAndLatestTrueOrderBySubmittedAtDesc(
            Long trackId
    );

    List<Submission>
    findByTeamId(
            Long teamId
    );
}