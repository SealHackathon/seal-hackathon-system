package com.minhtung.hackathon.dto.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

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
    private int roundQuantity = 0;
    private String roundName;
        private LocalDateTime roundSubmissionDeadline;
    private String scroringTemplateUrl;
    private int submissionQuantity;
    private int  roundOrdinalNumber; // so thu tu team
}
