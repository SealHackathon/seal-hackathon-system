package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.User;

import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.Role;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByToken(String token);

    boolean existsByEmail(String email);


    // Tìm các User có Role là USER và ID của họ KHÔNG NẰM TRONG danh sách memberID đang có team (status = true)
    @Query("""
        SELECT u
        FROM User u
        WHERE u.role = :role
        AND u.id NOT IN (
            SELECT m.member.id
            FROM Member m
            WHERE m.status = :status
        )
    """)
    List<User> findUsersWithoutTeam(@Param("role") Role role, @Param("status") MemberStatus status);

}

