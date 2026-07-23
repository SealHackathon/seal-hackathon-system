package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamSummaryDTO {
    private Long id;
    private String teamName;
    private Integer rank;
    private Double avgScore;
}