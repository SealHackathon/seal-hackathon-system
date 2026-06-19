package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.enums.EventStatus;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
public class EventRequest {
    private String name;
    private String description;
    private int minTeamMember;
    private int maxTeamMember;
    private String topic;
    private String bannerImg;
    private String thumbnail_image;
    private String rules;
    private String eventLocation;
    private String participationBenefits;
}