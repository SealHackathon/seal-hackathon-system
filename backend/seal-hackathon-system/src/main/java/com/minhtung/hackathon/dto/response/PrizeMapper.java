package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.entity.PrizeResult;

public class PrizeMapper {

    // Map không kèm team
    public static PrizeDTO toDTO(Prize prize) {
        return new PrizeDTO(
                prize.getId(),
                prize.getDescription(),
                prize.getMoney(),
                prize.getPrizeType(),
                prize.getPrizeName(),
                prize.getQuantity()
        );
    }

    // Map kèm team đã gán (nếu có)
    public static PrizeDTO toDTO(Prize prize, PrizeResult result) {
        PrizeDTO dto = toDTO(prize);
        if (result != null) {
            dto.setTeamId(result.getTeam().getId());
            dto.setTeamName(result.getTeam().getName());
        }
        return dto;
    }
}