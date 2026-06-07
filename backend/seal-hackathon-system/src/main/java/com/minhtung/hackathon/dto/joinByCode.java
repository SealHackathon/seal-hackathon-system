package com.minhtung.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class joinByCode {
        private String inviteCode;
        private String name;
        private String school;
}
