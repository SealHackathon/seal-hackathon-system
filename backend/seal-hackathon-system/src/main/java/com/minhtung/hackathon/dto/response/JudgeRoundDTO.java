package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JudgeRoundDTO {

    private long roundId;
    private LocalDateTime timeStart;
    private LocalDateTime timeEnd;
    private String name;

    private boolean allCategories;

    private List<String> categories;
}