package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogOverviewResponse {
    private long totalActions;
    private long scoreSubmissions;
    private long scoreEdits;
    private long violationsFlagged;
}