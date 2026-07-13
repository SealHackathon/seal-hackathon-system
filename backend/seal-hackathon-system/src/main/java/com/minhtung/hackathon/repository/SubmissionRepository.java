package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.Submission; // Thay thế bằng entity thực tế của bạn
import com.minhtung.hackathon.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    findByTeamTrackIdAndLatestTrueOrderBySubmittedAtDesc(
            Long trackId
    );

    List<Submission>
    findByTeamId(
            Long teamId
    );


    List<Submission> findByRound_IdAndLatestTrue(long roundId);


    @Query("""
SELECT s
FROM Submission s
JOIN JudgeAssignment ja
    ON ja.track.id = s.team.track.id
WHERE ja.user.id = :judgeId
  AND ja.round.id = :roundId
  AND s.round.id = :roundId
  AND s.latest = true
ORDER BY s.submittedAt DESC
""")
    List<Submission> findSubmissionForJudge(
            @Param("judgeId") Long judgeId,
            @Param("roundId") Long roundId
    );

    int countByRoundAndLatestTrue(Round round);

    int countByRoundAndTeam_TrackInAndLatestTrue(Round round, List<Track> tracks);



}