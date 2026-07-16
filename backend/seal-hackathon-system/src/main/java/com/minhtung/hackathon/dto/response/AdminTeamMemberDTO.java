package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminTeamMemberDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String school;
    private String role;           // LEADER, MEMBER
    private String memberStatus;   // OFFICAL, RESERVE, OUT
    private String joinMethod;
}
