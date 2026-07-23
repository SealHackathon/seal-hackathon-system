package com.minhtung.hackathon.dto.round;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoundInfoResponseDTO {
    private String roundName;
    private Integer publishStage;
}