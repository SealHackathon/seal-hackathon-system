package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UpdateStudentProfileRequest {

    private String bio ;
    private List<String> positons ;
    private Map<String, List<String>> tags ;
    private List<String> topics ;

}
