package com.minhtung.hackathon.dto.result;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoundResultResponse {
    private LocalDateTime updatedAt;
    private ReviewDTO review;
    private List<JudgeSummaryDTO> judges;
    private List<EntryDTO> entries;
    private AwardsDTO awards;
}