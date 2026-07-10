package com.minhtung.hackathon.dto.result;

import lombok.Data;

import java.util.Map;

@Data
public class JudgeScoreDTO {
    private String judge;
    private boolean submitted;
    private Map<String, Double> scores;
    private Double total;
}