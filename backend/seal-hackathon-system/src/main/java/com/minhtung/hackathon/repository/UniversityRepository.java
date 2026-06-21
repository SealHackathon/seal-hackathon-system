package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UniversityRepository extends JpaRepository<University,Long> {
    Optional<University> findByName(String name );
}
