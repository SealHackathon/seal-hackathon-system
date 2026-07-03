package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.minhtung.hackathon.dto.event.AllEventResponse;
import com.minhtung.hackathon.enums.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ScoringTemplateResponse {
    private long id;
    private String name;
    private String description;
    private LocalDateTime lastModified;
    private int usageCount;
    @JsonProperty("isDraft")
    private boolean draft;

    private List<CriterionResponse> criteria;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class CriterionResponse {
        private String name;
        private double weight;
        private String  description;
    }
}
