package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.TeamStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    List<Member> findByTeamIdAndStatus(long teamId, MemberStatus status);


    Optional<Member> findByTeamIdAndMemberId(Long teamId, long MemberID);

    boolean existsByTeamIdAndMemberIdAndStatusIn(Long teamId, long MemberId, List<MemberStatus> statusList);

    //tim member by id
    //tim leader by id
    Optional<Member> findByMemberIdAndStatus(long MemberId, MemberStatus status);

    Optional<Member> findByMemberIdAndStatusIn(long MemberId,List<MemberStatus> statusList);

    Optional<List<Member>> findByTeamId(Long teamId);

    //đếm số lượng thành viên trong team trạng thái active
    int countByTeamIdAndStatus(long teamId, MemberStatus status);

    boolean existsByMemberIdAndStatus(long memberID, MemberStatus status);
    boolean existsByMemberIdAndStatusIn(long memberID, List<MemberStatus> statusList);
    Member findByMemberIdAndRole(long leaderId, MemberRole role);

    //find by id and status
    void deleteAllByTeamId(long teamId);

    //
    Optional<Member> findByIdAndStatus(long id, MemberStatus status);

    @Query("SELECT COUNT(m) FROM Member m " +
            "WHERE m.team.track.event.id = :eventId " +
            "AND m.team.status = :teamStatus " +
            "AND m.status = :memberStatus")
    int countOfficialParticipants(
            @Param("eventId") Long eventId,
            @Param("teamStatus") TeamStatus teamStatus,
            @Param("memberStatus") MemberStatus memberStatus
    );
    Optional<Member> findByMemberIdAndRoleAndStatus(
            long memberId,
            MemberRole role,
            MemberStatus status
    );

    long countByTeam_Track_Event_Id(Long eventId);
}
