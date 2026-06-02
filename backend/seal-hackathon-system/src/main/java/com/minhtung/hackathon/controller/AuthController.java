package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.request.LoginRequest;
import com.minhtung.hackathon.dto.response.LoginResponse;
import com.minhtung.hackathon.dto.request.RegisterRequest;
import com.minhtung.hackathon.dto.response.RegisterResponse;
import com.minhtung.hackathon.dto.request.CompleteProfileRequest;
import com.minhtung.hackathon.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "Dang ky, xac nhan email")
public class AuthController {
    private final AuthService authService;

    @Operation(
            summary = "Dang ky tai khoan",
            description = "Gui email xac nhan toi Gmail sau khi dang ky"
    )
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        RegisterResponse result = authService.register(req);
        return ResponseEntity.ok(result);
    }


    @Operation(
            summary = "Xac nhan email",
            description = "User click link trong Gmail de kich hoat tai khoan"
    )
    @GetMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam String token) {
        String result = authService.verifyEmail(token);
        return ResponseEntity.ok().header("Content-Type", "text/html; charset=UTF-8").body(result);
    }

    @PostMapping("/resend")
    public ResponseEntity<String> resendMail(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendEmail(email));
    }

    //Complete profile
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody CompleteProfileRequest req) {
        return ResponseEntity.ok(authService.completeProfile(req));
    }




    //login
    @Operation(
            summary = "Dang nhap",
            description = "Tra ve JWT token va role (USER / LECTURER / ADMIN). " +
                    "Dung token nay trong header: Authorization: Bearer <token>"
    )

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        LoginResponse resp = authService.login(req);
        if (resp.getToken() == null) {
            return ResponseEntity.status(401).body(resp);
        }
        return ResponseEntity.ok(resp);
    }


}



