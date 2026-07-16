package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;

import lombok.Builder;

import lombok.Data;

import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data

@Builder

@NoArgsConstructor

@AllArgsConstructor

public class TeamRoundResultLecturerDTO {

    private Long roundId;

    private String roundName;          // MỚI

    private Integer ordinalNumber;     // MỚI

    private LocalDateTime timeStart;   // MỚI

    private LocalDateTime timeEnd;     // MỚI

    private Double teamTotalScore;

    private TeamRankDTO teamRank;

    private Integer totalTeamsInRound;

    private String trackName;

    private String submissionStatus;

    private SubmissionDTO submission;  // MỚI - null nếu chưa nộp

    private Boolean late;              // MỚI - null nếu chưa tới hạn/chưa nộp

    private List<NeighborDTO> neighbors; // MỚI - null nếu chưa công bố

    @Data

    @AllArgsConstructor

    @NoArgsConstructor

    public static class TeamRankDTO {

        private Integer rank;

        private Integer totalTeams;

    }

    @Data

    @AllArgsConstructor

    @NoArgsConstructor

    @Builder

    public static class SubmissionDTO {

        private String githubUrl;

        private String demoUrl;      // video

        private String documentUrl;  // slide

        private LocalDateTime submittedAt;

    }

    @Data

    @AllArgsConstructor

    @NoArgsConstructor

    @Builder

    public static class NeighborDTO {

        private Long teamId;

        private String teamName;

        private Integer rank;

        private Double score;

        private boolean isSelf;

    }

}