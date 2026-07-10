package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MentorRequestDTO {
    private String id;
    private String teamId;
    private String teamName;
    private String question;
    private String createdAt;
    private String answer;
    private String answeredAt;
}