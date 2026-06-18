package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}
