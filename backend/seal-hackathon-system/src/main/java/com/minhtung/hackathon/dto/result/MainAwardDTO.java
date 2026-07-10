package com.minhtung.hackathon.dto.result;

import lombok.Data;

@Data
public class MainAwardDTO {
    private String key; // "first" | "second" | "third"
    private TeamDTO team;
    private double score;
}