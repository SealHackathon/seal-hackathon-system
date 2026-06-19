package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.round.RoundRequest;
import com.minhtung.hackathon.entity.Round;
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

    // 1. GET ALL hoặc GET BY EVENT ID (Nếu truyền param ?eventId=...)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getRounds(@RequestHeader("Authorization") String auth,
                                       @RequestParam(required = false) Long eventId) {
        if (getUid(auth) == null) return unauthorized();

        if (eventId != null) {
//            return ResponseEntity.ok(roundService.getRoundsByEventId(eventId));
            return null;
        }
//        return ResponseEntity.ok(roundService.getAllRounds());
        return null;
    }

    // 2. GET BY ID - Xem chi tiết 1 vòng thi
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoundById(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
//            return ResponseEntity.ok(roundService.getRoundById(id));
            return null;
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // 3. CREATE - Tạo mới một vòng thi
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> createRound(@RequestHeader("Authorization") String auth, @RequestBody RoundRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {

            return ResponseEntity.status(201).body(roundService.createRound(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo vòng thi: " + e.getMessage());
        }
    }

    // 5. DELETE - Xóa vòng thi
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRound(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            roundService.deleteRound(id);
            return ResponseEntity.ok("Xóa thành công vòng thi có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
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
