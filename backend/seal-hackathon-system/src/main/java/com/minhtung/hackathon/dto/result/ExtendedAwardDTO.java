package com.minhtung.hackathon.dto.result;

import lombok.Data;

@Data
public class ExtendedAwardDTO {
    private long id;
    private String label;
    private TeamDTO team; // null nếu chưa gán
}