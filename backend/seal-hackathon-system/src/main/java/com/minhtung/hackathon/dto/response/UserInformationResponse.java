package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class UserInformationResponse {
    private Long userId;
    private String fullName;
    private LocalDateTime registeredDate;
    private  String email;
    private String phoneNumber;
    private String accountRole;
    private String accoutStatus;
    private String teamRole;
    private String teamName;
    private UserIdentityProfileResponse userIdentityProfileResponse;
    private String mssv;
    private String schoolName;
    private String studenntCardImg;
}
