package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.response.SearchMemberResponse;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.TeamService;
import com.minhtung.hackathon.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity.status(401).body("Token không hợp lệ");
    }
}
