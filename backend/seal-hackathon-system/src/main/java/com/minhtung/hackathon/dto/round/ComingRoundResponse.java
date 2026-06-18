package com.minhtung.hackathon.dto.round;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ComingRoundResponse {
    private int roundQuantity = 0;
    private String roundName;
    private LocalDateTime roundSubmissionDeadline;
    LocalDateTime roundStartTime;
    LocalDateTime roundEndTime;
    private String scroringTemplateUrl;
    private int submissionQuantity;
    private int roundOrdinalNumber; // so thu tu team
}
