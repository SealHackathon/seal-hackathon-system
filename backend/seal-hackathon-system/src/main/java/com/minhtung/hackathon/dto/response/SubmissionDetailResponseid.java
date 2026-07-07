package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionDetailResponseid {
    private Long id ;
    private Long teamId ;
    private String teamName ;
    private Long roundId ;
    private String roundName;
    private Long scoringTemplateId;

    private String githubUrl;
    private String demoUrl;
    private String documentUrl;

    private LocalDateTime submittedAt;
    private boolean latest;

}
