package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.entity.SystemRequest.RequestType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationResponseDTO {
    private long requestId;
    private String requestType;
    private String trackName;
    private String roundName;
    private String eventDescription;
    private String message;
}