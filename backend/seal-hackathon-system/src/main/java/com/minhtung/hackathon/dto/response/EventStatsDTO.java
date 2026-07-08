package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventStatsDTO {

    private int teamCount;

    private int participantCount;

    private int categoryCount;

    private int roundCount;
}