package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ViewSubmissionTrackResponse {
    private Long submissionId;

    private Long teamId;
    private String teamName;

    private Long trackId;
    private String trackName;

    private Long roundId;
    private String roundName;

    private LocalDateTime submittedAt ;

}
