package com.minhtung.hackathon.dto.request;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MilestoneRequest {
    private long eventId; // ID chung của Event mà các milestone này thuộc về
    private List<MilestoneItem> milestones;

    @Data
    public static class MilestoneItem {
        private String name;
        private LocalDateTime description;
        private LocalDateTime timeStart;
        private LocalDateTime timeEnd;
        private String des;
    }
}