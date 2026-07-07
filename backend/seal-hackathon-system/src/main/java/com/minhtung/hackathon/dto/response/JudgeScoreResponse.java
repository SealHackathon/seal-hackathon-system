package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JudgeScoreResponse {
    private Long id ;
    private Long submissionId ;
    private Long teamId ;
    private String teamName ;
    private Long roundId ;
    private String roundName ;
    private double totalScore ;
    private String comment ;
    private LocalDateTime submittedAt ;
    private LocalDateTime updateAt ;
    private List<JudgeScoreDetailResponse> details;

}
