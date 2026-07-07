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
    private boolean hasSubmission;
    public SubmissionConfigResponse(long id, String title, LocalDateTime openingTime, LocalDateTime submissionDeadline, String submissionInstructions, boolean hasSubmission) {
            this.id = id;
            this.title = title;
            this.openingTime = openingTime;
            this.submissionDeadline = submissionDeadline;
            this.submissionInstructions = submissionInstructions;
            this.hasSubmission = hasSubmission;
    }

    public SubmissionConfigResponse(long id, String title, String submissionInstructions, LocalDateTime openingTime, LocalDateTime submissionDeadline) {
        this.id = id;
        this.title = title;
        this.submissionInstructions = submissionInstructions;
        this.openingTime = openingTime;
        this.submissionDeadline = submissionDeadline;
        this.hasSubmission = false;

    }
}