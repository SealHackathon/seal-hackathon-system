package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamSubmissionDTO {
    private boolean github;
    private boolean video;
    private boolean slide;
}