package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.minhtung.hackathon.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NeedMemberTeamResponse {
    @JsonProperty("id")
    private long teamId;
    @JsonProperty("description")
    private String description;
    @JsonProperty("name")
    private String teamName;
    private List<TeamMemberResponse> members = new ArrayList<>();


    public void addMember(TeamMemberResponse member){
        members.add(member);
    }
}
