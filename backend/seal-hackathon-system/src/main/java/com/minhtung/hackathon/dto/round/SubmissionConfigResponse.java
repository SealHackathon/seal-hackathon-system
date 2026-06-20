package com.minhtung.hackathon.dto.round;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionConfigResponse {
    private long id;
    private String title;
    private String submissionInstructions;
    private LocalDateTime openingTime;
    private LocalDateTime submissionDeadline;
}