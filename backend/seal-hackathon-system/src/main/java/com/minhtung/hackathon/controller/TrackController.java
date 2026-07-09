package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.TrackRequest;
import com.minhtung.hackathon.dto.response.ViewTeamListRespone;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.TrackService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/track")
@RequiredArgsConstructor
@Tag(name = "Track Management")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class TrackController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final TrackService trackService;

    // 1. GET ALL hoặc GET BY EVENT ID (Ví dụ: /api/track?eventId=1)
    @GetMapping()
    public ResponseEntity<?> getTracks(@RequestHeader("Authorization") String auth,
                                       @RequestParam(required = false) Long eventId) {
        if (getUid(auth) == null) return unauthorized();

            return ResponseEntity.ok(trackService.getTracksByEventId(eventId));

    }

    // 2. GET BY ID - Xem chi tiết 1 track
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrackById(@RequestHeader("Authorization") String auth, @PathVariable Long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            return ResponseEntity.ok(trackService.getTrackById(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // 3. CREATE - Tạo mới một track
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> createTrack(@RequestHeader("Authorization") String auth, @RequestBody TrackRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {

            return ResponseEntity.status(201).body(trackService.createTracks(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo track: " + e.getMessage());
        }
    }

    // 4. UPDATE - Cập nhật track theo ID
//    @PreAuthorize("hasRole('ADMIN')")
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateTrack(@RequestHeader("Authorization") String auth, @PathVariable Long id, @RequestBody TrackRequest request) {
//        if (getUid(auth) == null) return unauthorized();
//        try {
//            Track updatedTrack = trackService.updateTrack(id, request);
//            return ResponseEntity.ok(updatedTrack);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Lỗi cập nhật track: " + e.getMessage());
//        }
//    }

    // 5. DELETE - Xóa track theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrack(@RequestHeader("Authorization") String auth, @PathVariable long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            trackService.deleteTrack(id);
            return ResponseEntity.ok("Xóa thành công track có ID: " + id);
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

    @GetMapping("/{trackId}/viewTeaminTrack")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<ViewTeamListRespone>>
    getTeamsByTrack(
            @PathVariable Long trackId
    ) {
        return ResponseEntity.ok(
                trackService.viewTeamByTrack(trackId)
        );
    }
}