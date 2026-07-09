package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoundTimelineDTO {

    private String time;

    private String title;

    private String desc;
}