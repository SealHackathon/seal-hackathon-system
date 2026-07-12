package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.TeamResult;
import com.minhtung.hackathon.enums.TeamResultStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


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
}


