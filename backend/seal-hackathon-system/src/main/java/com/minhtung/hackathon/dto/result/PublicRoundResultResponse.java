package com.minhtung.hackathon.dto.result;

import lombok.Data;
import java.util.List;

@Data
public class PublicRoundResultResponse {
    private boolean published;
    private List<PublicEntryDTO> entries;
    private AwardsDTO awards; // Tái sử dụng AwardsDTO bạn đã có
}

