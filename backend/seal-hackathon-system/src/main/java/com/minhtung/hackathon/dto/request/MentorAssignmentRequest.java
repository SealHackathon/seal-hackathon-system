package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class MentorAssignmentRequest {
    private long trackId;   // ID của nhánh đấu cần gán Mentor
    private long mentorId;  // ID của User đóng vai trò Mentor
}