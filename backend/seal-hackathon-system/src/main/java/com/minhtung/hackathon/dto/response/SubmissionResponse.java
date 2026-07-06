package com.minhtung.hackathon.dto.response;


import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.Submission;
import com.minhtung.hackathon.entity.Team;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponse {
    private  Long id ;
    private Team teamId ;
    private Round roundId ;
    private String githuburl ;
    private String demoUrl ;
    private String documenTrl ;
    private LocalDateTime submittedAt ;
    private boolean latest;

    public static  SubmissionResponse from(Submission submission){
        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam())
                .roundId(submission.getRound())
                .githuburl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documenTrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .latest(submission.isLatest())
                .build() ;
    }

}
