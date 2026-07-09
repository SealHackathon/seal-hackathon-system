package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JudgeAssignmentDTO {

    private List<JudgeRoundDTO> rounds;
}