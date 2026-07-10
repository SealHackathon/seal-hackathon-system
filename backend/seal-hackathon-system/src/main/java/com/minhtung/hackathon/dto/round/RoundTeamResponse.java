package com.minhtung.hackathon.dto.round;

import com.minhtung.hackathon.dto.response.TeamMembersResponseDetail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoundTeamResponse {
    private long teamId;
    private String teamName;
    private String trackName;
    private int memberCount;
    private String teamStatus;         // OPEN, APPROVED, v.v.

    // Thông tin bài nộp trong Vòng đấu này
    private boolean hasSubmission;
    private SubmissionContent submissionContent;      // Đường dẫn bài nộp (nếu có)


    // Danh sách thành viên đi kèm theo mẫu DTO của bạn
    private List<TeamMembersResponseDetail> members;
}