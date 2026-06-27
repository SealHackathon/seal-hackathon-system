package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LecturerResponse {
    private Long id;
    private String name;
    private String title;
    private String org;
}