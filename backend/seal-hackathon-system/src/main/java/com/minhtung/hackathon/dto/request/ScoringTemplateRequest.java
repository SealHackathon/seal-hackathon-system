package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ScoringTemplateRequest {
    private String name;
    private String description;
    private String url;

    // Nhận cấu trúc JSON dạng mảng động từ Frontend
    private List<CriterionRequest> criteria;
}