package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class SearchMemberResponse {

    private long id;
    private String name;
    private String email;
    @JsonProperty("school")
    private String schoolName;
    @JsonProperty("bio")
    private String description;

}
