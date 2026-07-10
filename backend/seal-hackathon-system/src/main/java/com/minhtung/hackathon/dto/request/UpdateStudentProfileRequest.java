package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateStudentProfileRequest {

    private String bio ;
    private List<String> positons ;
    private List<String> tags ;
    private List<String> topics ;

}
