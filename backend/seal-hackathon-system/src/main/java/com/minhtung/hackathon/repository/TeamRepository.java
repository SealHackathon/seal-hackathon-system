package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.dto.response.CreateTeamResponse;
import com.minhtung.hackathon.dto.response.NeedMemberTeamResponse;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.enums.TeamStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByInviteCodeAndStatus(String inviteCode, TeamStatus status);

    List<Team> findByNameContainingIgnoreCaseAndStatus(String name, TeamStatus status);

    boolean existsByInviteCode(String inviteCode);

    List<Team> findByStatus(TeamStatus status);

    Optional<Team> findByLeaderId(Long leaderId);


    Optional<Team> findByNameIgnoreCaseAndStatus(String teamName, TeamStatus status);


    @Query("SELECT COUNT(t) FROM Team t WHERE t.track.event.id = :eventId AND t.status = :status")
    int countTeamsByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") TeamStatus status);


    // Lấy danh sách team thuộc về một Track cụ thể
    List<Team> findByTrackId(Long trackId);

    // Hoặc lấy tất cả team thuộc về cùng 1 Event thông qua Track
    @Query("SELECT t FROM Team t WHERE t.track.event.id = :eventId")
    List<Team> findTeamsByEventId(@Param("eventId") Long eventId);
    @Query("""
    SELECT t
    FROM Team t
    WHERE t.track.event.id = :eventId
    AND t.status = :status
""")
    List<Team> findByEventIdAndStatus(
            @Param("eventId") Long eventId,
            @Param("status") TeamStatus status
    );
}
