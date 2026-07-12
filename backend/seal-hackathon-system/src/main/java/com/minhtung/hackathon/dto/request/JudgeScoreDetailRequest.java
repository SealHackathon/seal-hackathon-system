package com.minhtung.hackathon.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JudgeScoreDetailRequest {
    @NotNull(message = "criterionId là bắt buộc")
    private Long criterionId ;

    @NotNull(message = "score la bat buoc")
    private Double score ;
    private String comment ;

}
