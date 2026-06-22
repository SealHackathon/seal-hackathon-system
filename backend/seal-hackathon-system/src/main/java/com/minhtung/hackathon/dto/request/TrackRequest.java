package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class TrackRequest {
    private long eventId; // ID chung nằm ở ngoài mảng
    private List<TrackItem> tracks; // Mảng các bảng đấu (tracks) gửi lên từ FE

    @Data
    public static class TrackItem {
        private String name;
        private String des;
        private int minTeamPerTrack;
        private int maxTeamPerTrack;
    }
}