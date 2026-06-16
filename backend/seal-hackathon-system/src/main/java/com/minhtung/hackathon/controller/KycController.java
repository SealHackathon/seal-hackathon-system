package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.request.DiditWebhookRequest;
import com.minhtung.hackathon.dto.response.UserIdentityProfileResponse;
import com.minhtung.hackathon.service.DiditService;
import com.minhtung.hackathon.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/kyc")
@RequiredArgsConstructor
public class KycController {
    private final KycService kycService ;
    private final DiditService diditService ;

    @PostMapping("/session")
    public ResponseEntity<?> createSession(Authentication authentication) {
        return ResponseEntity.ok(
                kycService.createKycSesion(authentication.getName())
        );
    }


    @PostMapping("/webhook.digit")
    public ResponseEntity<?> ditiWebHook(@RequestBody String rawJson) {
        System.out.println("WEBHOOK RECEIVED");
        System.out.println(rawJson);
        kycService.handleDitiWebhook(rawJson);
        return ResponseEntity.ok("ok");
    }
    @PostMapping(value = "/student-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadStudentCard(
            @RequestParam MultipartFile file,
            @RequestParam String mssv ,
            @RequestParam String school ,
            Authentication authentication
    ) {
        String imageUrl = kycService.uploadStudentCart(
                authentication.getName(),
                file ,
                mssv ,
                school
        );

        return ResponseEntity.ok(imageUrl);
    }
    @PostMapping("/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long userId) {
        kycService.approveUser(userId);
        return ResponseEntity.ok("Duyệt user thành công");
    }

    @GetMapping("/didit/session/{sessionId}")
    public ResponseEntity<UserIdentityProfileResponse> getSession(
            @PathVariable String sessionId,
            @RequestParam Long userId
    ) {
        UserIdentityProfileResponse result = diditService.getSessionDetail(sessionId, userId);
        return ResponseEntity.ok(result);
    }
}

