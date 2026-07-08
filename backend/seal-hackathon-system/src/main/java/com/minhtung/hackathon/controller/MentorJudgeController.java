package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.BulkJudgeInviteRequest;
import com.minhtung.hackathon.dto.request.BulkMentorInviteRequest;
import com.minhtung.hackathon.dto.response.InvitationResponseDTO;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.MentorJudgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentor-judge")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MentorJudgeController {

    private final MentorJudgeService mentorJudgeService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

//    @PreAuthorize("hasRole('ADMIN')")
//    @PostMapping
//    public ResponseEntity<?> save(@RequestHeader("Authorization") String auth, @RequestBody MentorJudgeRequest request) {
//        if (getUid(auth) == null) return unauthorized();
//        mentorJudgeService.saveMentorsAndJudges(request);
//        return ResponseEntity.ok("Lưu mentor & giám khảo thành công");
//    }

    // ==========================================
    // ── MENTOR INVITE APIs ──
    // ==========================================




    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mentors/{userId}/invite")
    public ResponseEntity<?> sendMentorInvite(@RequestHeader("Authorization") String auth,
                                              @PathVariable long userId,
                                              @RequestParam long eventId,
                                              @RequestParam long trackId) { // Nhận trackId từ Frontend
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendInvite(userId, eventId, trackId);
        return ResponseEntity.ok("Đã gửi lời mời mentor cho track thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/mentors/{userId}/invite")
    public ResponseEntity<?> withdrawMentorInvite(@RequestHeader("Authorization") String auth,
                                                  @PathVariable long userId,
                                                  @RequestParam long eventId,
                                                  @RequestParam long trackId) { // Nhận trackId để xác định đúng lời mời cần rút
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.withdrawInvite(userId, eventId, trackId);
        return ResponseEntity.ok("Đã rút lời mời mentor");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mentors/invite-bulk")
    public ResponseEntity<?> sendBulkMentorInvites(@RequestHeader("Authorization") String auth,
                                                   @RequestBody BulkMentorInviteRequest request) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendBulkInvites(request);
        return ResponseEntity.ok("Đã xử lý gửi lời mời hàng loạt cho danh sách Mentor hợp lệ");
    }

    // ==========================================
    // ── JUDGE INVITE APIs ──
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/judges/{userId}/invite")
    public ResponseEntity<?> sendJudgeInvite(@RequestHeader("Authorization") String auth,
                                             @PathVariable long userId,
                                             @RequestParam long eventId,
                                             @RequestParam long trackId,  // Nhận trackId từ Frontend
                                             @RequestParam long roundId) { // Nhận roundId từ Frontend
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendJudgeInvite(userId, eventId, trackId, roundId);
        return ResponseEntity.ok("Đã gửi lời mời giám khảo chấm điểm vòng thi thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/judges/{userId}/invite")
    public ResponseEntity<?> withdrawJudgeInvite(@RequestHeader("Authorization") String auth,
                                                 @PathVariable long userId,
                                                 @RequestParam long eventId,
                                                 @RequestParam long trackId,
                                                 @RequestParam long roundId) {
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.withdrawJudgeInvite(userId, eventId, trackId, roundId);
        return ResponseEntity.ok("Đã rút lời mời giám khảo");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/judges/invite-bulk")
    public ResponseEntity<?> sendBulkJudgeInvites(@RequestHeader("Authorization") String auth,
                                                  @RequestBody BulkJudgeInviteRequest request) { // Sửa thành BulkJudgeInviteRequest
        if (getUid(auth) == null) return unauthorized();
        mentorJudgeService.sendBulkJudgeInvites(request);
        return ResponseEntity.ok("Đã xử lý gửi lời mời hàng loạt cho danh sách Giám khảo hợp lệ");
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

    // lấy những invitation pending đang gửi tới mình
    @GetMapping("/invitations")
    public ResponseEntity<List<InvitationResponseDTO>> getMyPendingInvitations(@RequestHeader("Authorization") String auth) {
        Integer userId = getUid(auth);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(mentorJudgeService.getPendingInvitationsForUser(userId));
    }

    // accept invitation
    @PostMapping("/invitations/{requestId}/accept")
    public ResponseEntity<?> acceptInvitation(@RequestHeader("Authorization") String auth,
                                              @PathVariable long requestId) {
        Integer userId = getUid(auth);
        if (userId == null) return unauthorized();

        mentorJudgeService.acceptInvitation(requestId, userId);
        return ResponseEntity.ok("Bạn đã chấp nhận lời mời thành công");
    }

    // reject invitation
    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<?> rejectInvitation(@RequestHeader("Authorization") String auth,
                                              @PathVariable long invitationId) {
        Integer userId = getUid(auth);
        if (userId == null) return unauthorized();

        mentorJudgeService.rejectInvitation(invitationId, userId);
        return ResponseEntity.ok("Bạn đã từ chối lời mời");
    }



}