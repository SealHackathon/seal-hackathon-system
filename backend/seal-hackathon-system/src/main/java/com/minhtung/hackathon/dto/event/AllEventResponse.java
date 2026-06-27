package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.enums.EventStatus;
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
public class AllEventResponse {
    private long eventId;
    private String eventName;
    private String eventTopic;
    private int maxTeamMember;
    private int teamQuantity=0;
    private int trackQuantity=0;
    private int candidateQuantity=0;
    private String eventLocation;
    private long prize;
    private String eventStatus;
    private int roundQuantity=0;
    private String description;
    private String thumbnail;
    // --- THÊM: Danh sách các mốc thời gian của sự kiện ---
    private List<MilestoneItemResponse> milestones;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class MilestoneItemResponse {
        private long id;
        private String milestoneName;
        private LocalDateTime dateStart;
        private LocalDateTime dateEnd;
        private String des;
        private String status; // UPCOMING, IN_PROGRESS, COMPLETED...
    }
}
