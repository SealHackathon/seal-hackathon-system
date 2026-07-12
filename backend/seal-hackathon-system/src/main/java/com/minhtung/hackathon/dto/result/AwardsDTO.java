package com.minhtung.hackathon.dto.result;

import lombok.Data;

import java.util.List;

@Data
public class AwardsDTO {
    private List<MainAwardDTO> main;
    private List<ExtendedAwardDTO> extended;
}