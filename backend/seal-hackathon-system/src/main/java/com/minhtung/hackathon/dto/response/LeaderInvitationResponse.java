package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data


public class LeaderInvitationResponse {
    private Long id;
    private long memberId;
    private String name;
    private String email;
}
