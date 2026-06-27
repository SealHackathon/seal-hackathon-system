package com.minhtung.hackathon.dto.response;


import com.minhtung.hackathon.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminParticipantReviewResponse {
    private Long userId ;
    private String phone ;
    private String email ;

    private String avatar ;
    private UserStatus status ;
    private String fullname ;


    //cccd
    private String fullnameCccd;

    private String cccd ;
    private  String gender ;
    private String dateofbirth ;
    private String thuongtru ;
    private String frontcccd ;
    private String backcccd ;

    //thong tin sinh vien
    private String mssv ;
    private String SchoolName ;
    private String StudentCartImg ;

}
