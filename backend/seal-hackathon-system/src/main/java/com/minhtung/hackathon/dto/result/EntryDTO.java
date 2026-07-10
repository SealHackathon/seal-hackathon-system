package com.minhtung.hackathon.dto.result;

import lombok.Data;

import java.util.List;

@Data
public class EntryDTO {
    private TeamDTO team;
    private int assignedCount;
    private String tieBreakNote;
    private DiscrepancyDTO discrepancy;
    private ViolationDTO violation;
    private String ended; // null | "eliminated" | "withdrawn"
    private List<JudgeScoreDTO> perJudge;
}