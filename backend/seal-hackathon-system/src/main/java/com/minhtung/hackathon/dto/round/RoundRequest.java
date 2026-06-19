package com.minhtung.hackathon.dto.round;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RoundRequest {
    private String name;
    private LocalDateTime timeStart;
    private LocalDateTime timeEnd;
    private boolean hasSubmission;
    private boolean hasPresetiontation; // Giữ nguyên chính tả theo Entity của bạn
    private int topTeamPass;
    private int ordinal_number;
    private LocalDateTime submissionDeadline;
    private long eventId;
}