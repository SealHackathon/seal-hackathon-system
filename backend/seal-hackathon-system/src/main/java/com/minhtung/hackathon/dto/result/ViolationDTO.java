package com.minhtung.hackathon.dto.result;

import lombok.Data;

@Data
public class ViolationDTO {
    private boolean flagged;
    private String reason;
}