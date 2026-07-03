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

    List<User> findByRole(Role role);

    boolean existsByPhoneNumber(String phonenumber);

    // Tìm các User có Role là USER và ID của họ KHÔNG NẰM TRONG danh sách memberID đang có team (status = true)
    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN Member m ON m.member.id = u.id " +
            "WHERE u.role = :role " +
            "AND (" +
            "    m.id IS NULL " + // Trường hợp 1: Người này hoàn toàn chưa từng tham gia team nào (không có dòng nào trong bảng Member)
            "    OR NOT (" +       // Trường hợp 2: Có dòng trong bảng Member nhưng phải loại bỏ những người sau đây:
            "        (m.team.id = :currentTeamId AND m.status <> :outStatus) " + // Đang ở trong team mình (chưa OUT)
            "        OR m.status = :officialStatus" +                             // Hoặc đã là OFFICIAL ở bất kỳ đâu
            "    )" +
            ")")
    List<User> findUsersWithoutTeam(
            @Param("role") Role role,
            @Param("currentTeamId") Long currentTeamId,
            @Param("officialStatus") MemberStatus officialStatus,
            @Param("outStatus") MemberStatus outStatus
    );


    List<User> findByRoleAndFullNameContainingIgnoreCase(Role role, String query);

}

