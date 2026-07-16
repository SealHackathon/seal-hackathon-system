package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminTeamResponse {
    private Long teamId;
    private String teamName;
    private String teamStatus;       // OPEN, PENDING_APPROVAL, APPROVED, REJECTED
    private String description;
    private Long leaderId;
    private String leaderName;
    private String leaderEmail;
    private int memberCount;
    private Long trackId;
    private String trackName;
    private String createdAt;        // LocalDate.toString()
    private Long requestId;          // ID của TeamRequest TEAM_SUBMISSION (nếu có, null nếu chưa submit)
    private List<AdminTeamMemberDTO> members;
}
