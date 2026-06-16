package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiditWebhookRequest {
    private String sessionId;
    private String status;
    private String cmnd;
    private String fullName;
    private String hometown;
    private String thuongtru;
}
