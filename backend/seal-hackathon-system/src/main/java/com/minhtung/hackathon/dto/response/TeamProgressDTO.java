package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamProgressDTO {
    private int done;
    private int total;
}