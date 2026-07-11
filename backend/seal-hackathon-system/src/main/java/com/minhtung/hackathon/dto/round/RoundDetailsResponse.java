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
public class RoundDetailsResponse {
    private long roundId;              // ID của vòng thi đang xem
    private String roundName;          // Tên vòng thi (Vòng ý tưởng, Chung kết...)
    private int roundOrdinalNumber;    // Số thứ tự của vòng thi trong Event
    private LocalDateTime roundStartTime;
    private LocalDateTime roundEndTime;
    private LocalDateTime roundSubmissionDeadline;
    private String scroringTemplateUrl; // Link file tiêu chí chấm điểm
    private int topTeamPass;
    // Thống kê số lượng
    private int submissionQuantity;    // Số lượng bài đã nộp trong vòng này
    private int roundQuantity;         // Tổng số lượng vòng thi của Event này (giúp FE vẽ timeline)
    
    private String status;             // Trạng thái vòng thi (UPCOMING, IN_PROGRESS, COMPLETED)

    private Long rubricId;

    private SubmissionConfigResponse submissionConfig;

    // --- THÊM: Mảng lịch trình chi tiết của vòng thi này ---
    private List<TimelineResponse> timelines;

    // --- THÊM: Mảng lịch trình chi tiết của vòng thi này ---
    private List<CriteriaResponse> criteria;

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

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class CriteriaResponse {
        private long id;
        private String name;
        private String description;
        private float weight;
    }
}