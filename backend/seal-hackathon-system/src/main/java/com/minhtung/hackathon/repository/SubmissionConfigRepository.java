package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.SubmissionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmissionConfigRepository extends JpaRepository<SubmissionConfig, Long> {

    void deleteByRoundId(Long roundId);

    Optional<SubmissionConfig> findByRoundId(Long roundId);
}