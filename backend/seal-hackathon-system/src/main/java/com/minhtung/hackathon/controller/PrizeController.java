package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.PrizeRequest;
import com.minhtung.hackathon.dto.response.PrizeResponse;
import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.PrizeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prize")
@RequiredArgsConstructor
@Tag(name = "Prize Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class PrizeController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PrizeService prizeService;


    // 2. GET BY eventId - Xem chi tiết 1 giải thưởng
    @GetMapping("/{id}")
    public ResponseEntity<?> getPrizeById(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            return ResponseEntity.ok(prizeService.getPrizesByEventId(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // 3. CREATE - Tạo mới một giải thưởng
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createPrize(@RequestHeader("Authorization") String auth, @RequestBody PrizeRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            List<PrizeResponse> newPrizes = prizeService.createPrizes(request);
            return ResponseEntity.status(201).body(newPrizes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo giải thưởng: " + e.getMessage());
        }
    }

    // 4. UPDATE - Cập nhật giải thưởng theo ID
//    @PreAuthorize("hasRole('ADMIN')")
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updatePrize(@RequestHeader("Authorization") String auth, @PathVariable Long id, @RequestBody PrizeRequest request) {
//        if (getUid(auth) == null) return unauthorized();
//        try {
//            Prize updatedPrize = prizeService.updatePrize(id, request);
//            return ResponseEntity.ok(updatedPrize);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Lỗi cập nhật giải thưởng: " + e.getMessage());
//        }
//    }

    // 5. DELETE - Xóa giải thưởng theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrize(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            prizeService.deletePrize(id);
            return ResponseEntity.ok("Xóa thành công giải thưởng có ID: " + id);
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