package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.ScoringTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoringTemplateRepository extends JpaRepository<ScoringTemplate, Long> {

}