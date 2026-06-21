package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.MilestoneRequest;
import com.minhtung.hackathon.dto.response.MilestoneResponse;
import com.minhtung.hackathon.entity.Milestone;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.MilestoneService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestone")
@RequiredArgsConstructor
@Tag(name = "Milestone Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class MilestoneController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final MilestoneService milestoneService;

    // 1. GET ALL hoặc GET BY EVENT ID (Ví dụ: /api/milestone?eventId=1)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getMilestones(@RequestHeader("Authorization") String auth,
                                           @RequestParam(required = false) Long eventId) {
        if (getUid(auth) == null) return unauthorized();

        if (eventId != null) {
            return ResponseEntity.ok(milestoneService.getMilestonesByEventId(eventId));
        }
        return ResponseEntity.ok(milestoneService.getAllMilestones());
    }

    // 2. GET BY ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getMilestoneById(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            return ResponseEntity.ok(milestoneService.getMilestoneById(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // 3. CREATE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> createMilestone(@RequestHeader("Authorization") String auth, @RequestBody MilestoneRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            List<MilestoneResponse> newMilestone = milestoneService.createMilestones(request);
            return ResponseEntity.status(201).body(newMilestone);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo milestone: " + e.getMessage());
        }
    }

    // 4. UPDATE
//    @PreAuthorize("hasRole('ADMIN')")
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateMilestone(@RequestHeader("Authorization") String auth, @PathVariable Long id, @RequestBody MilestoneRequest request) {
//        if (getUid(auth) == null) return unauthorized();
//        try {
//            Milestone updatedMilestone = milestoneService.updateMilestone(id, request);
//            return ResponseEntity.ok(updatedMilestone);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Lỗi cập nhật milestone: " + e.getMessage());
//        }
//    }

    // 5. DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMilestone(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            milestoneService.deleteMilestone(id);
            return ResponseEntity.ok("Xóa thành công mốc thời gian có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // --- Helper Methods ---
    private Integer getUid(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email)
                    .map(u -> Math.toIntExact(u.getId()))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity.status(401).body("Token không hợp lệ hoặc đã hết hạn");
    }
}