package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.Criterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CriterionRepository extends JpaRepository<Criterion, Long> {
    List<Criterion> findByScoringTemplateId(long scoringTemplateId);
}