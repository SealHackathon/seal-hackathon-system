package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDetailForMentorDTO {
    private Long teamId;
    private String teamName;
    private String trackName;
    private List<TeamMemberDTO> members;
}