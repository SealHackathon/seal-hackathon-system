package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MilestoneDTO {
    private long id;
    private String title;
    private String date;
    private String endDate;
}