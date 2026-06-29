package com.minhtung.hackathon.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhtung.hackathon.dto.request.UpdateStudentProfileRequest;
import com.minhtung.hackathon.dto.response.LecturerResponse;
import com.minhtung.hackathon.dto.response.SearchMemberResponse;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.KycService;
import com.minhtung.hackathon.service.TeamService;
import com.minhtung.hackathon.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class UserController {


    private final TeamService teamService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserService userService;
    private final KycService kycService;

    //get user chua co team
    @GetMapping("/free-users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String auth
    ) {
        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        return ResponseEntity.ok().body(userService.getMemberNoTeam(uid));
    }


    private Integer getUid(String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email)
                    .map(u -> Math.toIntExact(u.getId()))
                    .orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Operation(
            summary = "update thong tin sv",
            description = "topic , bio ,...."
    )


    //
    @PutMapping(value = "/student-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateStudentProfile(
            Authentication authentication,
            @RequestPart(value = "avatar", required = false) MultipartFile avatarFile,
            @RequestPart(value = "data") String profileDataJson
    ) {
        try {
            // 1. Chuyển đổi chuỗi JSON 'data' thành Object DTO
            ObjectMapper objectMapper = new ObjectMapper();
            UpdateStudentProfileRequest req = objectMapper.readValue(profileDataJson, UpdateStudentProfileRequest.class);

            // 2. Truyền cả dữ liệu và file xuống Service để xử lý (Up Cloudinary nếu có file)
            return ResponseEntity.ok(
                    kycService.updatesStudentProfile(authentication.getName(), req, avatarFile)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ: " + e.getMessage());
        }
    }

    @Operation(
            summary = "upanh",
            description = "cv_img avatar."
    )
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAvatar(
            Authentication authentication,
            @RequestParam MultipartFile file
    ) {
        return ResponseEntity.ok(
                kycService.updateAvatar(authentication.getName(), file)
        );
    }

    // api get lecturor
    @GetMapping("/lecturers")
    public ResponseEntity<List<LecturerResponse>> getLecturers(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(userService.getLecturers(q));
    }

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity.status(401).body("Token không hợp lệ");
    }
}