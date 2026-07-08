package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignmentDTO {

    private JudgeAssignmentDTO judge;

    private MentorAssignmentDTO mentor;
}