package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackResponse {
    private Long id;
    private String name;
    private String des;
    private int maxTeamPerTrack;
    private int minTeamPerTrack;
    private long eventId;
    public TrackResponse(long id, String name, String des, int minTeamPerTrack, int maxTeamPerTrack, long eventId) {
    this.id = id;
    this.name = name;
    this.des = des;
    this.maxTeamPerTrack = maxTeamPerTrack;
    this.minTeamPerTrack = minTeamPerTrack;
    this.eventId = eventId;
    }
}