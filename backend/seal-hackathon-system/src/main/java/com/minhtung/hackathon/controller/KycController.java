package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.response.UserIdentityProfileResponse;
import com.minhtung.hackathon.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/kyc")
@RequiredArgsConstructor
public class KycController {
    private final KycService kycService;


    @PostMapping(value = "/cccd", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> scanCccd(
            @RequestPart("front_img") MultipartFile front_img,
            @RequestPart("back_img") MultipartFile back_img,
            Authentication authentication
    ) {
        UserIdentityProfileResponse response = kycService.scanCccd(authentication.getName(), front_img,back_img);

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/face-match", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?>faceMatch(
            @RequestParam MultipartFile  selfie_img,
            Authentication authentication
    ){
        return ResponseEntity.ok(kycService.verifySelfie(authentication.getName(),selfie_img)) ;
    }

    @PostMapping(value = "/student-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadStudentCard(
            @RequestParam MultipartFile file,
            @RequestParam String mssv,
            @RequestParam String school,
            Authentication authentication
    ) {
        String imageUrl = kycService.uploadStudentCart(
                authentication.getName(),
                file,
                mssv,
                school
        );

        return ResponseEntity.ok(imageUrl);
    }


}
