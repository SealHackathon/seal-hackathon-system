package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;


@Data
@Builder
public class SubmissionListResponse {

    private Long id ;
    private Long teamId ;
    private String teamName ;
    private Long  roundId ;
    private LocalDateTime sumbittedAt ;

}
