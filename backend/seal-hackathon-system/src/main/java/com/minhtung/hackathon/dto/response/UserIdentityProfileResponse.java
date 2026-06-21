package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserIdentityProfileResponse {

        private Long id;
        private String fullName;
        private String cmnd;
        private String dateOfBirth;
        private String gender;
//        private String nationality;

        private String hometown;
        private String thuongtru;





        private String frontcmnd_img;
        private String CmndBack_img ;
        private String face_img ;

       private UserStatus status ;

    //private String adminNote;
    }

