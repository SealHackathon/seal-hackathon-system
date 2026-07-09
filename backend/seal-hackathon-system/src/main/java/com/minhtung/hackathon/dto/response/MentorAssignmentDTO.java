package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MentorAssignmentDTO {

    private List<String> categories;
}