package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class JoinTeamResponse {
    private long id;
    private String name;
    private String email;
    private String message;
}
