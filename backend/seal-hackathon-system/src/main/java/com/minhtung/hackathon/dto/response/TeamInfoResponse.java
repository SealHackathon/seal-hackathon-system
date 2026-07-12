package com.minhtung.hackathon.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class TeamInfoResponse {
    private String teamName;
    private String description;
    private String teamCode;
    private String teamStatus;
    private TrackResponse category;
    private int maxSlots;
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class TrackResponse {
        private long id;
        private String trackName;
        private String desc;
        private int currentTeams;
        private int teamLimit;
    }
}
