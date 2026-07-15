package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamRoundResultDTO {
    private Long roundId;
    private Double teamTotalScore;
    private TeamRankDTO teamRank;
    private Integer totalTeamsInRound;
    private String trackName;
    private String submissionStatus;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TeamRankDTO {
        private Integer rank;
        private Integer totalTeams;
    }
}