package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.repository.RoundRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.RoundService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/round")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")

public class RoundController {
    @Autowired
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RoundService roundService;

    // api admin view Coming Round
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/coming")
    public ResponseEntity<?> getLiveEvent(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        try {
            return ResponseEntity.ok(roundService.getComingRound());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

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
