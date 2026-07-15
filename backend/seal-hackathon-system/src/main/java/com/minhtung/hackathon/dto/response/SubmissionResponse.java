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
    private Long id;
    private Long teamId;
    private Long roundId;
    private String githubUrl;
    private String demoUrl;
    private String documentUrl;
    private LocalDateTime submittedAt;

    //đanh dấu đây là bai nộp mới nhất
    private boolean latest;


    public static  SubmissionResponse from(Submission submission){
        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .roundId(submission.getRound().getId())
                .githubUrl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documentUrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .latest(submission.isLatest())
                .build() ;
    }

}