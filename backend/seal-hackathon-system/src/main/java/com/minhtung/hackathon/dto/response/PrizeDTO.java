package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.enums.PrizeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrizeDTO {
    private long id;
    private String description;
    private int money;
    private PrizeType prizeType;
    private String prizeName;
    private int quantity;

    private Long teamId;     // null nếu chưa gán
    private String teamName; // null nếu chưa gán

    // Constructor cũ (không kèm team) - dùng khi chỉ cần list cấu hình thuần
    public PrizeDTO(long id, String description, int money, PrizeType prizeType, String prizeName, int quantity) {
        this.id = id;
        this.description = description;
        this.money = money;
        this.prizeType = prizeType;
        this.prizeName = prizeName;
        this.quantity = quantity;
    }
}