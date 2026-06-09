package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class EdiTeamRequest {
    private String name;
    private String description;
}
