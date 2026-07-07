package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Student_profile;
import com.minhtung.hackathon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentprofileRepository extends JpaRepository<Student_profile,Long> {
    Optional<Student_profile>findByUserId(Long userId);
     ;
}
