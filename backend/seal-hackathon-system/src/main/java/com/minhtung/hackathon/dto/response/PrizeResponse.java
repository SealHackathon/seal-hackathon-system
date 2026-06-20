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
}