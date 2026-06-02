package com.minhtung.hackathon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CompleteProfileResponse {
    private boolean success;
    private String message;
}
