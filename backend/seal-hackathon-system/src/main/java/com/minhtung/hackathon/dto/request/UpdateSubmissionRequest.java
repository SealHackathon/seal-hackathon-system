package com.minhtung.hackathon.dto.request;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateSubmissionRequest {
    private String githubUrl ;
    private String demoUrl ;
    private String documentUrl ;

}
