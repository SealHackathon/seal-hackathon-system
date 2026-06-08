package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.HandleJoinTeamRequest;
import com.minhtung.hackathon.dto.request.InvitationRequest;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/teamrequest")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class TeamRequestController {

    private final TeamService teamService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    //leader view nhung request xin vao doi cua team này
    //chuc nang cua leader
    @GetMapping("/joinrequest")
    public ResponseEntity<?> viewJoinRequest(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try {
            return ResponseEntity.ok().body(teamService.viewJoinTeamRequest(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //leader view nhung invitation da gui di
    //chuc nang cua leader
    @GetMapping("/leader-invitation")
    public ResponseEntity<?> leaderViewInvitation(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try {
            return ResponseEntity.ok().body(teamService.leaderViewInvitation(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //leader send 1 invitation den user
    @PostMapping("/invitation")
    public ResponseEntity<?> leaderSendInvitation(
            @RequestBody InvitationRequest invitationRequest,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok().body(teamService.leaderSendInvitation(invitationRequest, uid));
    }


    //member view nhung invitation duoc gui toi minh
    //chuc nang cua member
    @GetMapping("/member-invitation")
    public ResponseEntity<?> memberViewInvitation(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok().body(teamService.memberViewInvitation(uid));
    }

    //member view nhung request da gui di
    //chuc nang cua member
    @GetMapping("/member-request")
    public ResponseEntity<?> memberViewRequest(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok().body(teamService.memberViewRequest(uid));
    }


    @Operation(summary = "Gửi yêu cầu xin vào đội (JOIN_REQUEST)",
            description = "Leader của đội sẽ nhận và duyệt")

//    mot sinh vien gui request den 1 doi nen gui them message
    @PostMapping("/joinrequest")
    public ResponseEntity<?> requestJoin(
            @RequestBody JoinTeamRequest joinTeamRequest,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try {
            return ResponseEntity.ok(teamService.sendJoinRequest(joinTeamRequest, uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }


    //Leader duyet hoac tu choi Join_request
    //chuc nang cua leader
    @Operation(summary = "Leader duyet hoac tu choi Join_request")
    @PutMapping("/Join-request/respond")
    public ResponseEntity<String> respondJoinRequest(
            @RequestBody HandleJoinTeamRequest acceptJoinRequests,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try{
            return ResponseEntity.ok(teamService.respondToJoinRequest(acceptJoinRequests.getRequestId(), acceptJoinRequests.isAccept(), uid));
        }
        catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    //Member ACCEPT hoac REJECT invitation
    //chuc nang cua MEMBER
    @Operation(summary = "MEMBER duyet hoac tu choi Invitation")
    @PutMapping("/invitation-response")
    public ResponseEntity<String> respondJoinInvitation(
            @RequestBody HandleJoinTeamRequest acceptJoinRequests,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        // truyen vao requestId dong y hoac tu choi, va userId
        return ResponseEntity.ok(teamService.respondToInvitation(acceptJoinRequests.getRequestId(), acceptJoinRequests.isAccept(), uid));
    }


    //Leader xoa nhung invitation da gui di thong qua requestId
    //chuc nang cua leader
    @Operation(summary = "Leader Xoa Nhung invitation da gui di")
    @DeleteMapping("/invitation")
    public ResponseEntity<String> deleteInvitation(
            @RequestBody long memberId,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok(teamService.deleteInvitationByMemberId(memberId, uid));
    }

    //Leader xoa nhung invitation da gui di thong qua memberId
    //chuc nang cua leader
    @Operation(summary = "Leader Xoa Nhung invitation da gui di")
    @DeleteMapping("/invitation-bymember")
    public ResponseEntity<String> deleteInvitationByUserId(
            @RequestParam("memberId") long memberId,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok(teamService.deleteInvitationByMemberId(memberId, uid));
    }

    //sinh vien xoa nhung request da gui di
    //chuc nang cua member
    @Operation(summary = "Member Xoa Nhung request da gui di")
    @DeleteMapping("/request")
    public ResponseEntity<String> deleteRequest(
            @RequestBody long requestId,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok(teamService.deleteRequest(requestId));
    }

    //sinh vien xoa nhung request den team id
    //chuc nang cua member
    @Operation(summary = "Member Xoa Nhung invitation da gui di")
    @DeleteMapping("/member-request")
    public ResponseEntity<String> deleteRequestByTeamId(
            @RequestParam("teamId") long teamId,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try {
            return ResponseEntity.ok(teamService.deleteRequestByTeamId(teamId, uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }


    //member out team gui 1 leave request
    @PostMapping("/out-team")
    public ResponseEntity<?> outTeam(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }

        try {
            return ResponseEntity.ok().body(teamService.outTeam(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //member cancel LEAVE_TEAM_REQUEST
    @PostMapping("/out-team/cancle")
    public ResponseEntity<?> outTeamCancle(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }

        try {
            return ResponseEntity.ok().body(teamService.outTeamCancle(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    // leader get list LEAVE_REQUEST
    @GetMapping("/leave_request")
    public ResponseEntity<?> getLeaveRequestList(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }

        try {
            return ResponseEntity.ok().body(teamService.getLeaveRequestList(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    // leader get list LEAVE_REQUEST
    @PostMapping("/lock-team")
    public ResponseEntity<?> lockTeam(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }

        try {
            return ResponseEntity.ok().body(teamService.lockTeam(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }



//----------------------------------------------------------------------------------------  //Các task dưới đây chưa xử lý được

    //thanh vien gui yeu cau xin roi doi chưa xử lý được task này
//    @Operation(summary = "thanh vien gui yeu cau xin roi doi ")
//    @PostMapping("{teamId}/leave-request")
//    public ResponseEntity<String> leaveRequest(
//            @PathVariable Long teamId,
//
//            @RequestHeader("Authorization") String auth) {
//        Integer uid = getUid(auth);
//        if (uid == null) return unauthorized();
//        return ResponseEntity.ok(teamService.requestLeave(teamId, uid));
//    }

    //leader duyet hoac tu choi leave_request
    //chuc nang cua leader

    @Operation(summary = "leader duyet hoac tu choi leave_request")
    @PutMapping("/Leave-request/{memberId}/respond")
    public ResponseEntity<String> respondLeaveRequest(
            @PathVariable long memberId,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        return ResponseEntity.ok(teamService.respondToLeaveRequest(memberId,uid));
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
