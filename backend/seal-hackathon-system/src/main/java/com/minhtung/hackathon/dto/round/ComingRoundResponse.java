package com.minhtung.hackathon.dto.round;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ComingRoundResponse {
    private int roundQuantity = 0;
    private String roundName;
    private LocalDateTime roundSubmissionDeadline;
    LocalDateTime roundStartTime;
    LocalDateTime roundEndTime;
    private String scroringTemplateUrl;
    private int submissionQuantity;
    private int roundOrdinalNumber; // so thu tu team

    // --- THÊM: Danh sách lịch trình chi tiết của vòng đấu sắp tới ---
    private List<TimelineResponse> timelines;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class TimelineResponse {
        private long id;
        private String name;
        private String description;
        private String timeStart;
        private String timeEnd;
    }
}
