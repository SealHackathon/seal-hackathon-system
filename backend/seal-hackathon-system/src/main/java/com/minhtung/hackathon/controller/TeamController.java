package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.response.CreateTeamResponse;
import com.minhtung.hackathon.dto.joinByCode;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
@Tag(name = "Team", description = "Lập đội, tham gia, tìm kiếm, chốt đội, Admin duyệt")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")

public class TeamController {

    private final TeamService teamService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;


    //mot nguoi tao 1 doi moi
    @Operation(summary = "Lập đội mới",
            description = "Tạo đội (status=OPEN) + gửi INVITATION cho thành viên")
    @PostMapping("/create")
    public ResponseEntity<?> createTeam(
            @RequestBody CreateTeamDto dto, @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        try {
            CreateTeamResponse result = teamService.createTeam(dto, uid);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }


    }

    @Operation(summary = "Tham gia đội qua mã mời",
            description = "Chỉ áp dụng khi đội OPEN; tự động vào đội không cần duyệt")

//    test xong ok ham user join team by team code
    @PostMapping("/join-by-code")
    public ResponseEntity<?> joinByCode(
            @RequestBody joinByCode dto,
            @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) return unauthorized();
        try {
            return ResponseEntity.ok(teamService.joinTeamByCode(dto.getInviteCode(), uid));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //    Needing member teams
    @GetMapping("/needing-members")
    @Operation(summary = "Lay nhung team dang thieu thanh vien")
    public ResponseEntity<?> getTeamsNeedingMembers(
            @RequestHeader("Authorization") String auth
    ) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();

        }
        try {
            return ResponseEntity.ok().body(teamService.getNeedMemberTeams(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    //    tim kiem team by name
    @Operation(summary = "Tim kiem doi OPEN theo ten")
    @GetMapping("/search")
    public ResponseEntity<List<CreateTeamResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(teamService.searchTeam(keyword));
    }

    // xem team hien tai --- tra ve thong bao neu chua co team

    @Operation(summary = "Tra ve danh sach thanh vien cua team hien tai")
    @GetMapping("/my-team")
    public ResponseEntity<?> getMyTeam(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok().body(teamService.getAllMembers(uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    //kick 1 member ra khoi team
    @PutMapping("/kick/{id}")
    public ResponseEntity<?> kickMember(@PathVariable("id") long id, @RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok().body(teamService.kickMember(id, uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    //leader trao quyen cho thanh vien khac
    @PutMapping("/promote/{id}")
    public ResponseEntity<?> promoteMember(@PathVariable("id") long memberId,
                                           @RequestHeader("Authorization") String auth
    ) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }
        try {
            return ResponseEntity.ok().body(teamService.promoteMember(memberId, uid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }


//    @Operation(summary = "Leader chốt đội gửi Admin phê duyệt (TEAM_SUBMISSION)",
//            description = "Team status chuyển sang PENDING_APPROVAL")
//    @PostMapping("/{teamId}/submit")
//
//
//    public ResponseEntity<String> sumbit(
//            @PathVariable int teamId,
//
//            @RequestHeader("Authorization") String auth) {
//        Integer uid = getUid(auth);
//        if (uid == null) return unauthorized();
//        return ResponseEntity.ok(teamService.submitTeamForApporal(teamId, uid));
//
//
//    }

    @Operation(summary = "Admin duyệt hoặc từ chối TEAM_SUBMISSION",
            description = "APPROVED → Team.status=APPROVED, mã mời bị vô hiệu hoá")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/submission/{requestId}/review")
    public ResponseEntity<String> adminReview(
            @PathVariable Integer requestId,
            @RequestParam boolean approve) {
        return ResponseEntity.ok(teamService.adminReviewTeam(requestId, approve));
    }


    //thành viên trong team lấy role của mình

    @GetMapping("/my-role")
    public ResponseEntity<?> getRole(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token không hợp lệ");
        }

        try {
            String role = teamService.getTeamRole(uid);
            return ResponseEntity.ok().body(role);
        } catch (IllegalArgumentException e) {
            // Nếu không tìm thấy thành viên, trả về lỗi 404 kèm thông báo công khai
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    //member out team
    @PutMapping("/out-team")
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


    //get team info
    @GetMapping("/team-info")
    public ResponseEntity<?> getTeamInfo(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token không hợp lệ");
        }

        try {
            return ResponseEntity.ok().body(teamService.getTeamInfo(uid));
        } catch (IllegalArgumentException e) {
            // Nếu không tìm thấy thành viên, trả về lỗi 404 kèm thông báo công khai
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // check name
    @GetMapping("/check-name")
    public ResponseEntity<?> checkname(@RequestHeader("Authorization") String auth, @RequestParam("name") String name) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token không hợp lệ");
        }

        try {
            return ResponseEntity.ok().body(teamService.checkName(  name));
        } catch (IllegalArgumentException e) {
            // Nếu không tìm thấy thành viên, trả về lỗi 404 kèm thông báo công khai
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    //lay FAKE RESULTS BY CODE check code
    @GetMapping("/check-code")
    public ResponseEntity<?> checkcode(@RequestHeader("Authorization") String auth, @RequestParam("code") String code) {
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }
        return ResponseEntity.ok().body(teamService.checkCode(code));
    }


}

