package com.minhtung.hackathon.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data

public class AccountStatusResponse {
    private String teamRole;
    private String status;
}
