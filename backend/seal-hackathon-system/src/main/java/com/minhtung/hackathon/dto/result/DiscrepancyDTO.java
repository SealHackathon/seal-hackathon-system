package com.minhtung.hackathon.dto.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscrepancyDTO {
    private boolean flagged;
    private double stdDev;
}