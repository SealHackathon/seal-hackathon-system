package com.minhtung.hackathon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamDto {
    private String name ; //team name
    private String description ; //team description
    private List<String> inviteEmails ; //member emails list
}
