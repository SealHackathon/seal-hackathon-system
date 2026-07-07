package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.ScoringTemplateRequest;
import com.minhtung.hackathon.entity.ScoringTemplate;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.ScoringTemplateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scoring-template")
@RequiredArgsConstructor
@Tag(name = "Scoring & Criterion Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class ScoringTemplateController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ScoringTemplateService templateService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getAll(@RequestHeader("Authorization") String auth) {
        if (getUid(auth) == null) return unauthorized();
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

//    @PreAuthorize("hasRole('ADMIN')")
//    @GetMapping("/{id}")
//    public ResponseEntity<?> getById(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
//        if (getUid(auth) == null) return unauthorized();
//        try {
//            return ResponseEntity.ok(templateService.getTemplateById(id));
//        } catch (Exception e) {
//            return ResponseEntity.status(404).body(e.getMessage());
//        }
//    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id
    ) {
        if (getUid(auth) == null) {
            return unauthorized();
        }

        return ResponseEntity.ok(
                templateService.getTemplateById(id)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> create(@RequestHeader("Authorization") String auth, @RequestBody ScoringTemplateRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            ScoringTemplate created = templateService.createTemplate(request);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo biểu mẫu chấm điểm: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String auth, @PathVariable Long id, @RequestBody ScoringTemplateRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            ScoringTemplate updated = templateService.updateTemplate(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật biểu mẫu chấm điểm: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            templateService.deleteTemplate(id);
            return ResponseEntity.ok("Xóa thành công mẫu chấm điểm có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // --- Helpers ---
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
        return ResponseEntity.status(401).body("Token không hợp lệ");
    }
}