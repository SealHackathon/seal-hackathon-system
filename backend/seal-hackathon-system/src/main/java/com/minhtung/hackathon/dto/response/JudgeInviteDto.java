package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
@NoArgsConstructor

public class JudgeInviteDto {
    private Long id;
    private ReceiverDto receiver;
    private Long trackId;
    private Long roundId;
    private String status;
    private LocalDateTime sentAt;
    // getters/setters
}
