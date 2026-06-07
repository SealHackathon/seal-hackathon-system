package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//join team by code
@AllArgsConstructor
@NoArgsConstructor
@Data


public class SearchTeamByCodeResponse {
   private String teamCode;
    private String type;
   private TeamByCodeResponse team;
}
