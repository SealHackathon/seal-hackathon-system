package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class OutTeamResponse {
    private long id;
    private String name;
    private String message;
}
