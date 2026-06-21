package com.minhtung.hackathon.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String schoolName;
    private String studentId;
    private String email;
    private String password;
    private String phone ;



}
