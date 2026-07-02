package com.minhtung.hackathon.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class ScoringTemplateRequest {
    private String name;
    private String description;

    private boolean tieBreaker;
    private double deviationThreshold;

    private String status;

    private List<CriterionRequest> criteria;

    @Data
    public static class CriterionRequest {
        private String name;
        private String description;
        private float weight;
    }
}