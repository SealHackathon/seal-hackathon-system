package com.minhtung.hackathon.dto.request;

import lombok.Data;

@Data
public class PrizeRequest {
    private String prizeName;
    private String description;
    private int money;
    private long eventId; // Để xác định giải thưởng thuộc về sự kiện nào khi tạo mới/sửa
}