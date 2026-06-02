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

    List<Member> findByTeamIdAndStatus(Integer teamId, boolean status);


    Optional<Member> findByTeamIdAndMemberID(Long teamId , long MemberID);

    boolean existsByTeamIdAndMemberIDAndStatus(Long teamId , long MemberId , boolean status) ;
    //tim member by id
    Optional<Member> findByMemberID(long MemberId );
    //tim leader by id
    Optional<List<Member>> findByTeamId(Long teamId );

    //đếm số lượng thành viên trong team trạng thái active
    int countByTeamIdAndStatus(long teamId , boolean status);

    boolean existsByMemberIDAndStatus(long memberID , boolean status);

    Member findByMemberIDAndRole(long leaderId, MemberRole role);

}
