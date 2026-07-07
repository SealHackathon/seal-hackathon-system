package com.minhtung.hackathon.dto.request;


import jakarta.validation.constraints.NotEmpty;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;


@Data
public class JudgeScoreRequest {
    @NotNull(message = "không được  để trống ")
    private Long submissionId ;

    private String comment ;

    @NotEmpty(message = "Phải nhập điểm tiêu chí")
    private List<JudgeScoreDetailRequest> details;
}
