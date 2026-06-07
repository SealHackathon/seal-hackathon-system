package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.enums.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MemberRepository extends JpaRepository<Member,Long> {

    List<Member> findByTeamIdAndStatus(long teamId, boolean status);


    Optional<Member> findByTeamIdAndMemberId(Long teamId , long MemberID);

    boolean existsByTeamIdAndMemberIdAndStatus(Long teamId , long MemberId , boolean status) ;
    //tim member by id
    //tim leader by id
    Optional<Member> findByMemberIdAndStatus(long MemberId,boolean status );
    Optional<List<Member>> findByTeamId(Long teamId );

    //đếm số lượng thành viên trong team trạng thái active
    int countByTeamIdAndStatus(long teamId , boolean status);

    boolean existsByMemberIdAndStatus(long memberID , boolean status);

    Member findByMemberIdAndRole(long leaderId, MemberRole role);
    //find by id and status
    void deleteAllByTeamId(long teamId);
}
