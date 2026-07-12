package com.minhtung.hackathon.dto.result;

import lombok.Data;

@Data
public class ExtendedAwardDTO {
    private String id;
    private String label;
    private TeamDTO team; // null nếu chưa gán
}