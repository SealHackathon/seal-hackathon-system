package com.minhtung.hackathon.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MilestoneRequest {
    private String milestoneName;
    private LocalDate dateStart;
    private LocalDate dateEnd;
    private String des;
    private long eventId; // ID của Event chứa mốc thời gian này
}