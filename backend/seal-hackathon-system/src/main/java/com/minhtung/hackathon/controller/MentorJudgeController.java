package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.BulkInviteRequest;
import com.minhtung.hackathon.dto.request.MentorJudgeRequest;
import com.minhtung.hackathon.entity.SystemRequest;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.MentorJudgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mentor-judge")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MentorJudgeController {

    private final MentorJudgeService mentorJudgeService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> save(@RequestHeader("Authorization") String auth, @RequestBody MentorJudgeRequest request) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.saveMentorsAndJudges(request);
        return ResponseEntity.ok("Lưu mentor & giám khảo thành công");
    }

    // ── MENTOR INVITE APIs ──
//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mentors/{userId}/invite")
    public ResponseEntity<?> sendMentorInvite(@RequestHeader("Authorization") String auth,
                                              @PathVariable long userId, @RequestParam long eventId) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendInvite(userId, eventId, SystemRequest.RequestType.MENTOR_INVITE);
        return ResponseEntity.ok("Đã gửi lời mời mentor");
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/mentors/{userId}/invite")
    public ResponseEntity<?> withdrawMentorInvite(@RequestHeader("Authorization") String auth,
                                                  @PathVariable long userId, @RequestParam long eventId) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.withdrawInvite(userId, eventId, SystemRequest.RequestType.MENTOR_INVITE);
        return ResponseEntity.ok("Đã rút lời mời mentor");
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mentors/invite-bulk")
    public ResponseEntity<?> sendBulkMentorInvites(@RequestHeader("Authorization") String auth, @RequestBody BulkInviteRequest request) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendBulkInvites(request, SystemRequest.RequestType.MENTOR_INVITE);
        return ResponseEntity.ok("Đã gửi lời mời hàng loạt cho danh sách Mentor");
    }

    // ── JUDGE INVITE APIs ──
//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/judges/{userId}/invite")
    public ResponseEntity<?> sendJudgeInvite(@RequestHeader("Authorization") String auth,
                                             @PathVariable long userId, @RequestParam long eventId) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendInvite(userId, eventId, SystemRequest.RequestType.JUDGE_INVITE);
        return ResponseEntity.ok("Đã gửi lời mời giám khảo");
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/judges/{userId}/invite")
    public ResponseEntity<?> withdrawJudgeInvite(@RequestHeader("Authorization") String auth,
                                                 @PathVariable long userId, @RequestParam long eventId) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.withdrawInvite(userId, eventId, SystemRequest.RequestType.JUDGE_INVITE);
        return ResponseEntity.ok("Đã rút lời mời giám khảo");
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/judges/invite-bulk")
    public ResponseEntity<?> sendBulkJudgeInvites(@RequestHeader("Authorization") String auth, @RequestBody BulkInviteRequest request) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendBulkInvites(request, SystemRequest.RequestType.JUDGE_INVITE);
        return ResponseEntity.ok("Đã gửi lời mời hàng loạt cho danh sách Giám khảo");
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