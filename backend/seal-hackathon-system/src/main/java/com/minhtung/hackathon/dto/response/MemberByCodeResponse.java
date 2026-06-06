package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// join team by code
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MemberByCodeResponse {
    @JsonProperty("id")
    private long memberId;
    @JsonProperty("isLeader")
    private boolean leader=false;
    private String name;
    private String school;
}
