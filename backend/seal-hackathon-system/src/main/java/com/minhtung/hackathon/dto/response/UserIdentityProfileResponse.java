package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserIdentityProfileResponse {

        private Long id;
        private String fullName;
        private String cmnd;
        private String dateOfBirth;
        private String gender;
        private String nationality;

        private String hometown;
        private String thuongtru;

        private String diditsesion;
        private String diditStatus;
        private String face_img ;
        private String studentCardUrl;
        private String CmndBack_img ;



    //private String adminNote;
    }

