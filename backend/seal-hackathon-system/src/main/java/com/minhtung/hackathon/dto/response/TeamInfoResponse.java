package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class TeamInfoResponse {
    private String teamName;
    private String description;
    private String teamCode;
}
