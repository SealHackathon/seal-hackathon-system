package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.dto.response.MilestoneResponse;
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
public class LiveEventResponse {
    private long eventId;
    private String eventName;
    private String eventTopic;
    private int maxTeamMember;
    private int teamQuantity = 0;
    private int trackQuantity = 0;
    private int candidateQuantity = 0;
    private String eventLocation;
    private long prize;
    private String eventStatus;
    private String description;
    // List milestone
    private List<MilestoneResponse> milestones;

//    private int roundQuantity = 0;
//    private String roundName;
//        private LocalDateTime roundSubmissionDeadline;
//    private String scroringTemplateUrl;
//    private int submissionQuantity;
//    private int  roundOrdinalNumber; // so thu tu team
}
