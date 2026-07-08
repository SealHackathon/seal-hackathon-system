package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CurrentRoundDTO {

    private long id;

    private int index;

    private int total;

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime submissionDeadline;

    private List<RoundTimelineDTO> schedule;
}