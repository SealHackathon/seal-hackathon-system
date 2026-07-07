package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamResultResponse {
    private Long teamReasultId ;
    private Long teamId ;
    private String teamName ;
    private Long trackId ;
    private String trackName ;
    private Long RoundId ;
    private String roundName ;
    private double totalScore ;
    private int ranking ;
    private boolean passed ;
    private String status ;


}
