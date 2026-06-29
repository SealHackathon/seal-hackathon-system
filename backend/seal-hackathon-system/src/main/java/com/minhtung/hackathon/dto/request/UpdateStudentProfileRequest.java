package com.minhtung.hackathon.dto.request;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UpdateStudentProfileRequest {
    private String avatar;
    private String cvLink;
    private String bio ;
    private List<String> positons ;
    // Thay đổi từ List<String> thành Map để nhận cấu trúc động
    private Map<String, List<String>> techTags;
    private List<String> topics ;

}
