package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class TrackRequest {
    private String name;
    private String des;
    private int minTeamPerTrack;
    private int maxTeamPerTrack;
    private long eventId; // Bắt buộc để biết Track này thuộc về Event nào
}