package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class TeamMemberResponse {
    private long id;
    private String name;
    private String school;
    @JsonProperty("isLeader")
    private boolean leader=false;
}
