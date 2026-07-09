package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
@NoArgsConstructor
@AllArgsConstructor
@Data
public class StudentProfileResponse {
    private Long id ;
    private String  img_studentcard ;
    private String bio ;
    private String avatar ;
    private List<String> positions;
    private Map<String, List<String>> techTags;
    private List<String>  topics;
    private String status;

}