package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JudgeScoreDetailResponse {
    private Long id ;
    private Long criterionId ;
    private String criterionName;
    private double score ;
    private double maxScore ;
    private float weight ;
    private String commet ; 
}
