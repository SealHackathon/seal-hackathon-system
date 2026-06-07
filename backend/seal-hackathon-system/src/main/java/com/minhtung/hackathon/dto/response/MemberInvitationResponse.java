package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class MemberInvitationResponse {
    private long id;
    private String teamName;
    private int memberCount;
    private int maxSlots;
    String message;
}
