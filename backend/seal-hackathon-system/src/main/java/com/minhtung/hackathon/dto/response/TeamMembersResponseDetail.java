package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class TeamMembersResponseDetail {
    private long id;
    private String name;
    private String email;
    private String school;
    @JsonProperty("isLeader")
    private boolean leader;
    @JsonProperty("isCurrentUser")
    private boolean currentUser;
    @JsonProperty("isOffical")
    private boolean offical;
    private String memberStatus;
    private String joinMethod;
    private String bio;
    private List<String> positions;
    private Map<String, List<String>> techTags;
    private List<String> topics;
    private String cvLink;


}
