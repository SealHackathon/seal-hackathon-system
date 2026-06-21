package com.minhtung.hackathon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FaceMatchResponse {
    private boolean matched ;
    private double score ;
    private int attempts ;
    private boolean canContinue ;
    private boolean needManuaReview ;
    private String message ;
}
