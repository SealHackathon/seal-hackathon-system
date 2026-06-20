package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class JudgeAssignmentRequest {
    private long trackId; // ID của Nhánh đấu (Track)
    private long judgeId; // ID của Giám khảo (User)
}