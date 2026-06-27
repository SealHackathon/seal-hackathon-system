package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.MentorAssignmentRequest;
import com.minhtung.hackathon.entity.MentorAssignment;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.MentorAssignmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mentor-assignment")
@RequiredArgsConstructor
@Tag(name = "Mentor Assignment Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class MentorAssignmentController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final MentorAssignmentService mentorAssignmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getAssignments(@RequestHeader("Authorization") String auth, @RequestParam Long trackId) {
        if (getUid(auth) == null) return unauthorized();
        return ResponseEntity.ok(mentorAssignmentService.getMentorsByTrack(trackId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> assignMentor(@RequestHeader("Authorization") String auth, @RequestBody MentorAssignmentRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            MentorAssignment created = mentorAssignmentService.assignMentor(request);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeAssignment(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            mentorAssignmentService.removeAssignment(id);
            return ResponseEntity.ok("Đã hủy phân công Mentor thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Integer getUid(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email).map(u -> Math.toIntExact(u.getId())).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity.status(401).body("Token không hợp lệ hoặc đã hết hạn");
    }
}