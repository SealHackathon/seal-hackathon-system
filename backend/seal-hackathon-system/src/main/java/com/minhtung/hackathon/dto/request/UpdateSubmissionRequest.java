package com.minhtung.hackathon.dto.request;


import lombok.Data;

@Data
public class UpdateSubmissionRequest {
    private String githubUrl ;
    private String demoUrl ;
    private String documentUrl ;

}
