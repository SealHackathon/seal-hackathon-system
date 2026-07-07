package com.minhtung.hackathon.dto.request;


import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateJudgeScoreRequest {
    private String commet ;
    @NotEmpty(message = "Phải nhập điểm tiêu chí")
    private List<JudgeScoreDetailRequest> details;
}
