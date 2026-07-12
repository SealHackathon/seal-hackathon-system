package com.minhtung.hackathon.dto.result;

import lombok.Data;
import java.util.List;



@Data
public class PublicEntryDTO {
    private TeamDTO team;
    private double finalScore; // Chỉ hiển thị điểm tổng cuối cùng, giấu danh sách perJudge đi
    private int rank;          // Thứ hạng (1, 2, 3...)
}