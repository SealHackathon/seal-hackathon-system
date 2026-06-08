package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class MemberInvitationResponse {
    private long id;
    private String teamName;
    private int memberCount;
    private int maxSlots;
    private String message;
    private String description;
    private List<TeamMemberResponse> members = new ArrayList<>();

    public void addMember(TeamMemberResponse member) {
        members.add(member);
    }
}
