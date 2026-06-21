package com.minhtung.hackathon.dto.round;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoundRequest {
    private String name;
    private LocalDateTime timeStart;
    private LocalDateTime timeEnd;
    private boolean hasPresetiontation;
    private int topTeamPass;
    private int ordinal_number;
    private LocalDateTime submissionDeadline;
    private long eventId;

    // Thêm các trường mới theo yêu cầu của bạn
    private String position; // Chuỗi text vị trí
    private long rubricId;   // ID của tiêu chí chấm điểm để assign cho round

    // Cấu hình SubmissionConfig đi kèm
    private SubmissionConfigInfo submissionConfig;

    // Mảng danh sách các mốc Timeline của Round
    private List<RoundTimelineItem> timelines;

    @Data
    public static class SubmissionConfigInfo {
        private String title;
        private String submissionInstructions;
        private LocalDateTime openingTime;
        private LocalDateTime submissionDeadline;
        private boolean hasSubmission;
    }

    @Data
    public static class RoundTimelineItem {
        private String name;
        private String description;
        private LocalDateTime timeStart;
        private LocalDateTime timeEnd;
    }
}