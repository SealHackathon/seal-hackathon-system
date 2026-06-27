package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class PrizeRequest {
    private long eventId; // ID chung cho tất cả giải thưởng trong request này
    private List<PrizeItem> prizes;
    private String participationBenefits;

    @Data
    public static class PrizeItem {
        private String prizeName;
        private String description;
        private int money;
        private int quantity;
        private String prizeType;
    }
}