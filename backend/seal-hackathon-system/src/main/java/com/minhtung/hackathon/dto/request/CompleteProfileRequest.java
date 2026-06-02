package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class CompleteProfileRequest {
        private String email;
        private String fullName;
}
