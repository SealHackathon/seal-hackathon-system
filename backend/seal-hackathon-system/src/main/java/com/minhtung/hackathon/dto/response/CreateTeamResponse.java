package com.minhtung.hackathon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamResponse {
    private long id ;
    private String name ;
    private String inviteCode ;

}
