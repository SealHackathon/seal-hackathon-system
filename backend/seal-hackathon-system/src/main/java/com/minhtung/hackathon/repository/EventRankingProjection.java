package com.minhtung.hackathon.repository;

public interface EventRankingProjection {
    Long getTeamId();
    String getTeamName();
    Long getTrackId();
    String getTrackName();
    Double getAverageScore();

}
