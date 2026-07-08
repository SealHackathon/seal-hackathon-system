package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AssignedEventResponseDTO {

    private long id;

    private String name;

    private String theme;

    private String description;

    private List<String> roles;

    private AssignmentDTO assignment;

    private EventStatsDTO stats;

    private CurrentRoundDTO currentRound;
}