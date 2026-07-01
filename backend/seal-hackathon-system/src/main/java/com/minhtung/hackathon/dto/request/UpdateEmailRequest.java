package com.minhtung.hackathon.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmailRequest {

    @NotBlank(message = "khong duoc de trong")
    private String currentEmail ;
    @NotBlank(message = "khong duoc de trong")
    @Email(message = "Email moi khong dung ding dang ")
    private String newEmail ;
}
