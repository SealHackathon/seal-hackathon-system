package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class JoinTeamRequest {
    private long teamId;
    private String message;
}
