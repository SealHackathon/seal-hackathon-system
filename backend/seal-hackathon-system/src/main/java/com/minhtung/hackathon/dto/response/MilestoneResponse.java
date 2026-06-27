package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor

public class MilestoneResponse {
    private long id;
    private String milestoneName;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private String des;
    private String status;

    public MilestoneResponse(long id, String milestoneName, LocalDateTime dateStart, LocalDateTime dateEnd, String des, String status) {
    this.id = id;
    this.milestoneName = milestoneName;
    this.dateStart=dateStart;
    this.dateEnd=dateEnd;
    this.des=des;
    this.status=status;
    }
}