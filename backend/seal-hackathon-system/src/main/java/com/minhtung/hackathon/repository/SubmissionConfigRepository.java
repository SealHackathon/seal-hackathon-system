package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.SubmissionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionConfigRepository extends JpaRepository<SubmissionConfig, Long> {
}