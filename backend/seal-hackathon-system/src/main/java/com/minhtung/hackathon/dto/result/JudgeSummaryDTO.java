package com.minhtung.hackathon.dto.result;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JudgeSummaryDTO {
    private String id;
    private String name;
    private int assigned;
    private int scored;
    private LocalDateTime lastUpdate;
}