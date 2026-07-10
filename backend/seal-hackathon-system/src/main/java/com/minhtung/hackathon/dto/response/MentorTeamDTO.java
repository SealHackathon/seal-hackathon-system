package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MentorTeamDTO {
    private long id;
    private String name;
    private String leader;
    private int memberCount;
    private String leaderPosition;
    private String status; // 'competing' | 'top' | 'attention' | 'stopped'
    private String stoppedRound;
    private Integer rank;
    private Double score;
    private String currentRound;
    private TeamProgressDTO progress;
    private TeamSubmissionDTO submission;
    private int questionsTotal;
    private int pendingQuestions;
}