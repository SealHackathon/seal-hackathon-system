package com.minhtung.hackathon.dto.round;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoundRequest {
    private long eventId;           // ID của Event tổng để làm gốc tọa độ tìm kiếm và xóa cũ
    private List<RoundItem> rounds; // Mảng danh sách các vòng thi (Rounds) gửi lên từ Frontend

    @Data
    public static class RoundItem {
        private Long roundId; // Thêm trường này để nhận diện UPSET (Update/Insert)
        private String name;
        private String meetingLink; // link tham gia nếu cuộc thi tổ chức offline
        private LocalDateTime timeStart;
        private LocalDateTime timeEnd;
        private boolean hasPresetiontation; // Giữ nguyên chính tả thực thể cũ của bạn
        private String locationName;
        private String detailLocation;
        private int topTeamPass;
        private int ordinal_number;         // Giữ nguyên chính tả thực thể cũ của bạn
        private LocalDateTime submissionDeadline;
        private String position;            // Chuỗi text vị trí
        private long rubricId;              // ID của tiêu chí chấm điểm để assign cho round

        // Cấu hình SubmissionConfig đi kèm riêng của từng Vòng
        private SubmissionConfigInfo submissionConfig;

        // Mảng danh sách các mốc Timeline riêng của Vòng đấu này
        private List<RoundTimelineItem> timelines;
    }

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
        private String timeStart;
        private String timeEnd;
    }
}