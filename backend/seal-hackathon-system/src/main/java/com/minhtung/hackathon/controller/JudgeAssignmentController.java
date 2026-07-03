package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.JudgeAssignmentRequest;
import com.minhtung.hackathon.entity.JudgeAssignment;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.JudgeAssignmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/judge-assignment")
@RequiredArgsConstructor
@Tag(name = "Judge Assignment Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class JudgeAssignmentController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final JudgeAssignmentService judgeAssignmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getAssignments(@RequestHeader("Authorization") String auth, @RequestParam Long trackId) {
        if (getUid(auth) == null) return unauthorized();
        return ResponseEntity.ok(judgeAssignmentService.getJudgesByTrack(trackId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> assignJudge(@RequestHeader("Authorization") String auth, @RequestBody JudgeAssignmentRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            JudgeAssignment created = judgeAssignmentService.assignJudge(request);
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
            judgeAssignmentService.removeAssignment(id);
            return ResponseEntity.ok("Đã hủy phân công Giám khảo thành công!");
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