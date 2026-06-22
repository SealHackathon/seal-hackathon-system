package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrizeResponse {
    private Long id;
    private String prizeName;   // Ví dụ: Giải Nhất, Giải Nhì
    private double prizeValue;  // Giá trị tiền thưởng: 10000000
    private String description; // Mô tả phần thưởng kèm theo (nếu có)
    private int quantity;
    private long eventId;
    private String prizeType;

    public PrizeResponse(long id, String prizeName, int money, String description, int quantity, long eventId, String prizeType) {
        this.id = id;
        this.prizeName = prizeName;
        this.prizeValue = money;
        this.description = description;
        this.quantity = quantity;
        this.eventId = eventId;
        this.prizeType = prizeType;
    }
}