package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

// join team by code
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TeamByCodeResponse {
    @JsonProperty("name")
    private String teamName;
    private int memberCount;
    private int maxSlots;
    private String description;
    List<MemberByCodeResponse> members=new ArrayList<>();

    public void addMember(MemberByCodeResponse member){
        members.add(member);
    }
}
