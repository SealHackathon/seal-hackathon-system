package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MentorAssignmentDTO {
    private String category; // Category đại diện hiển thị chính (ví dụ phần tử đầu tiên)
    private List<String> categories;
    private List<MilestoneDTO> milestones;
    private List<MentorTeamDTO> teams;
    private List<MentorRequestDTO> requests;
}