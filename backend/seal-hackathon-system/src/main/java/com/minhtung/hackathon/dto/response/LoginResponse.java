package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    boolean activeAccount;
    private String token;
    private String role;
    private String email;
    private String message;
    private String fullname;
    private boolean hasTeam;
    private String teamRole;
    private long expiredTime;
    private UserStatus status ;

}
