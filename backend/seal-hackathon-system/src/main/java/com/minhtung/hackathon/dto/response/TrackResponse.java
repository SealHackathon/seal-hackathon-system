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

}