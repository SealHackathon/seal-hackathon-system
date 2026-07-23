package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyContextResponseDTO {
    private String role; // "TEAM" hoặc "MENTOR"
    private TeamSummaryDTO myTeam; // Dành cho Thí sinh (nếu là MENTOR thì trả về null)
    
    @Builder.Default
    private List<TeamSummaryDTO> myMentorTeams = new ArrayList<>(); // Dành cho Mentor (nếu là TEAM thì mảng rỗng [])


}