package com.minhtung.hackathon.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MilestoneRequest {
    private String milestoneName;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private String des;
    private long eventId; // ID của Event chứa mốc thời gian này
}