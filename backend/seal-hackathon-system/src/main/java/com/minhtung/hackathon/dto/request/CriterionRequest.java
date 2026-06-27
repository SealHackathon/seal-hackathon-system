package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class CriterionRequest {
    private String name;
    private String description;
    private float weight;
    private int maxRange;
}