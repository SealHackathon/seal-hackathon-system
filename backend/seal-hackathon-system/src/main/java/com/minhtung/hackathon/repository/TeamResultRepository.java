package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.dto.response.MyContextResponseDTO;
import com.minhtung.hackathon.dto.response.TeamSummaryDTO;
import com.minhtung.hackathon.entity.JudgeScore;
import com.minhtung.hackathon.entity.TeamResult;
import com.minhtung.hackathon.enums.TeamResultStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TeamResultRepository
        extends JpaRepository<TeamResult, Long> {
    // xep hang track  trong 1 round
    List<TeamResult>
    findByTeamTrackIdAndRoundIdOrderByTotalScoreDesc(
            Long trackId,
            Long roundId
    );


    // xep hang toàn round
    List<TeamResult>
    findByRoundIdOrderByTotalScoreDesc(
            Long roundId
    );

    //  Public Track
    List<TeamResult>
    findByTeamTrackIdAndRoundIdAndStatusOrderByTotalScoreDesc(
            Long trackId,
            Long roundId,
            TeamResultStatus status
    );



    //  Public Round
    List<TeamResult>
    findByRoundIdAndStatusOrderByTotalScoreDesc(
            Long roundId,
            TeamResultStatus status
    );

    //  Xếp hạng Event
    @Query("""
                SELECT
                    tr.team.id AS teamId,
                    tr.team.name AS teamName,
                    tr.team.track.id AS trackId,
                    tr.team.track.name AS trackName,
                    AVG(tr.totalScore) AS averageScore
                FROM TeamResult tr
                WHERE tr.round.event.id = :eventId
                GROUP BY
                    tr.team.id,
                    tr.team.name,
                    tr.team.track.id,
                    tr.team.track.name
                ORDER BY AVG(tr.totalScore) DESC
            """)
    List<EventRankingProjection> findEventRanking(
            @Param("eventId") Long eventId
    );

    // Public Event
    @Query("""
                SELECT
                    tr.team.id AS teamId,
                    tr.team.name AS teamName,
                    tr.team.track.id AS trackId,
                    tr.team.track.name AS trackName,
                    AVG(tr.totalScore) AS averageScore
                FROM TeamResult tr
                WHERE tr.round.event.id = :eventId
                AND tr.status = :status
                GROUP BY
                    tr.team.id,
                    tr.team.name,
                    tr.team.track.id,
                    tr.team.track.name
                ORDER BY AVG(tr.totalScore) DESC
            """)
    List<EventRankingProjection> findPublishedEventRanking(
            @Param("eventId") Long eventId,
            @Param("status") TeamResultStatus status
    );

    //  Công bố kết quả Track của một Round
    @Modifying
    @Query("""
                UPDATE TeamResult tr
                SET tr.status = :publishedStatus
                WHERE tr.team.track.id = :trackId
                AND tr.round.id = :roundId
            """)
    int publishTrackResults(
            @Param("trackId") Long trackId,
            @Param("roundId") Long roundId,
            @Param("publishedStatus")
            TeamResultStatus publishedStatus
    );


    // Lấy danh sách kết quả của một Team cụ thể dựa vào eventId
    @Query("SELECT tr FROM TeamResult tr " +
            "JOIN tr.round r " +
            "WHERE tr.team.id = :teamId AND r.event.id = :eventId")
    List<TeamResult> findByTeamIdAndEventId(@Param("teamId") Long teamId, @Param("eventId") Long eventId);

    // Đếm tổng số đội có kết quả (tham gia) trong một vòng thi cụ thể
    @Query("SELECT COUNT(tr) FROM TeamResult tr WHERE tr.round.id = :roundId")
    int countTotalTeamsInRound(@Param("roundId") Long roundId);


    @Query("SELECT COUNT(t) FROM Team t WHERE t.track.id = :trackId")
    int countTotalTeamsInTrack(@Param("trackId") Long trackId);

    // Tìm kết quả thi của Đội trong Vòng dựa trên teamId và roundId
    Optional<TeamResult> findByTeamIdAndRoundId(Long teamId, Long roundId);

    // lấy neighbors theo rank liền kề trong cùng round+track.
    @Query("""
            SELECT tr FROM TeamResult tr
            WHERE tr.round.id = :roundId
              AND tr.team.track.id = :trackId
              AND tr.ranking BETWEEN :fromRank AND :toRank
            ORDER BY tr.ranking ASC
            """)
    List<TeamResult> findNeighborsByRank(
            @Param("roundId") long roundId,
            @Param("trackId") long trackId,
            @Param("fromRank") int fromRank,
            @Param("toRank") int toRank);


    // TeamResultRepository.java

    // Query 1: Fetch TeamResult + Team + Track + JudgeScores + JudgeAssignment + User
    @Query("SELECT DISTINCT tr FROM TeamResult tr " +
            "LEFT JOIN FETCH tr.team t " +
            "LEFT JOIN FETCH t.track " +
            "LEFT JOIN FETCH tr.judgeScores js " +
            "LEFT JOIN FETCH js.judgeAssignment ja " +
            "LEFT JOIN FETCH ja.user " +
            "WHERE tr.round.id = :roundId " +
            "ORDER BY tr.ranking ASC")
    List<TeamResult> findBasicFullByRoundId(@Param("roundId") Long roundId);

    // Query 2: Fetch chi tiết details & criterion trực tiếp từ JudgeScore
    @Query("SELECT DISTINCT js FROM JudgeScore js " +
            "LEFT JOIN FETCH js.details d " +
            "LEFT JOIN FETCH d.criterion " +
            "WHERE js.teamResult.round.id = :roundId")
    List<JudgeScore> fetchJudgeScoreDetailsByRoundId(@Param("roundId") Long roundId);


    // 1. Dành cho MENTOR: Lấy danh sách kết quả các Đội thuộc các Track mà Mentor này phụ trách trong Round đó
    @Query("SELECT DISTINCT new com.minhtung.hackathon.dto.response.TeamSummaryDTO(" +
            "t.id, t.name, tr.ranking, tr.totalScore) " + // Đã đổi tr.avgScore -> tr.totalScore
            "FROM Team t " +
            "JOIN MentorAssignment ma ON ma.track.id = t.track.id " +
            "LEFT JOIN TeamResult tr ON tr.team.id = t.id AND tr.round.id = :roundId " +
            "WHERE ma.user.id = :mentorUserId")
    List<TeamSummaryDTO> findMentorTeamsResultByRound(@Param("roundId") Long roundId,
                                                      @Param("mentorUserId") Long mentorUserId);

    @Query("SELECT new com.minhtung.hackathon.dto.response.TeamSummaryDTO(" +
            "t.id, t.name, tr.ranking, tr.totalScore) " +
            "FROM Member tm JOIN tm.team t " +
            "LEFT JOIN TeamResult tr ON tr.team.id = t.id AND tr.round.id = :roundId " +
            "WHERE tm.member.id = :userId") // Changed tm.user.id to tm.member.id
    Optional<TeamSummaryDTO> findMyTeamResultByRound(@Param("roundId") Long roundId, @Param("userId") Long userId);
}


