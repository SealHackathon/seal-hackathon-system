package com.minhtung.hackathon.dto.response;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NotBlank
public class UpdateEmailResponse {
    private Boolean suucessful ;
    private String newEmail ;
    private String message ;

}
