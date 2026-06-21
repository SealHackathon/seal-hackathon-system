package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.entity.UserIdentityProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserIdentityProfileRepository extends JpaRepository< UserIdentityProfile,Long> {
    Optional<UserIdentityProfile> findByUserId(Long userId) ;

    Optional<UserIdentityProfile> findByUser(User user);
}
