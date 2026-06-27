package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class BulkJudgeInviteRequest {
    private long eventId;
    private long trackId;
    private long roundId;
    private List<Long> userIds;
}