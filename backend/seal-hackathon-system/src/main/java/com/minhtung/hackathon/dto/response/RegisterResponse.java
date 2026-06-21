package com.minhtung.hackathon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {
    private String schoolName;
    private String studentId;
    private String email;
    private  String phone ;


}
