package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.enums.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {
    private long id;
    private String name;
    private MemberRole role;
}