package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor

public class ReceiverDto {
    private Long id;
    private String fullName;
    private String title;
    private String orgName;
    private String avatarUrl;
    // getters/setters
}
