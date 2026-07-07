package com.minhtung.hackathon.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data

public class SubmissionRequest {
    @NotNull(message = "roundId là bắt buộc")
    private Long  roundId ;
    private String githUrl ;
    private String demoUrl ;
    private String documentUrl ;

}
