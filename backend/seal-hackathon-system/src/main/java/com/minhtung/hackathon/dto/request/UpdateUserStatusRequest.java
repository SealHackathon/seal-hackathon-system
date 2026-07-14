package com.minhtung.hackathon.dto.request;

import com.minhtung.hackathon.enums.UserStatus;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    private UserStatus status;
}