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
    private String topic; // tiêu đề của cuộc thi
    private String bannerImg;
    private String thumbnail_image;
    private String rules; // những quy định của cuộc thi
    private String eventLocation;
    private String participationBenefits;
    private  LocalDateTime openRegisterTime;
    private  LocalDateTime closeRegisterTime;
    private LocalDateTime cofirmTeamTime;
}