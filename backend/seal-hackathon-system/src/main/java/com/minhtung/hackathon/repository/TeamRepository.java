package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.dto.response.CreateTeamResponse;
import com.minhtung.hackathon.dto.response.NeedMemberTeamResponse;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.enums.TeamStatus;
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

//    Optional<Team> findByTeamCountCodeAndStatus(String inviteCode, TeamStatus status);

    // Lấy ra thực thể Team có số lượng thành viên (status = true) ít hơn 4
    @Query("""
            SELECT t
            FROM Team t
            LEFT JOIN Member m
            ON m.team = t
            AND m.status = true
            GROUP BY t
            HAVING COUNT(m.id) < 4
            """)
    List<Team> findTeamsWithLessThanFourMembers();

    //get team by Name ignore case
    Optional<Team> findByNameIgnoreCaseAndStatus(String teamName, TeamStatus status);
}
