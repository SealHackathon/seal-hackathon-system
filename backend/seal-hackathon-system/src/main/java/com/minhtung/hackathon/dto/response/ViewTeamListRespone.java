package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ViewTeamListRespone {
    private Long teamId ;
    private String teamName ;
    private String teamStatus ;
    private Long leaderId ;
    private String leaderName ;
    private Long trackId ;
    private  String trackName ;
    private int memberCount ;
    private boolean hassSubmissionn ;
    private Long submissionId ;

}
