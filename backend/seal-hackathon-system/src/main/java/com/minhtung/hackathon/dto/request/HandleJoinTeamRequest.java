package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class HandleJoinTeamRequest {
    private long requestId;
    private boolean accept;
}
