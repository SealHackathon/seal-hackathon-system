package com.minhtung.hackathon.dto.result;

import lombok.Data;

@Data
public class ReviewDTO {
    private int durationMin;
    private int remainingSec;
    private int pendingRequests;
    private int judgesAgreed;
    private int judgesTotal;
}