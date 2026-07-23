package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class LeaderboardTeamDTO {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Team {
        private Long id;
        private String teamName;
        private int rank;
        private double avgScore;

        // Các field dưới đây sẽ null nếu người dùng là Mentor của Track thuộc Team này
        private String status;
        private Boolean discrepancy; // TODO: Tính toán sau
        private List<JudgeScore> judges;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JudgeScore {
        private Long judgeId;
        private String judgeName;
        private double score;
        private List<CriteriaScore> criteriaScores;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CriteriaScore {
        private String name;
        private double score;
    }
}