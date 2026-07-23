package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.response.MyContextResponseDTO;
import com.minhtung.hackathon.dto.response.ViewTeamListRespone;
import com.minhtung.hackathon.dto.round.RoundDetailsResponse;
import com.minhtung.hackathon.dto.round.RoundInfoResponseDTO;
import com.minhtung.hackathon.dto.round.RoundRequest;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.repository.RoundRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.RoundService;
import com.minhtung.hackathon.service.TeamResultService;
import com.minhtung.hackathon.service.TeamService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private final TeamService teamService ;
    private final TeamResultService teamResultService;
    // api admin view Coming Round
//    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/coming")
    public ResponseEntity<?> getComingRound(@RequestHeader("Authorization") String auth) {
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

    //  GET BY EVENT ID (Nếu truyền param ?eventId=...)
//    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getRounds(@RequestHeader("Authorization") String auth,
                                       @RequestParam(required = false) Long eventId) {
        Integer uid=getUid(auth);
        if (getUid(auth) == null) return unauthorized();


        return ResponseEntity.ok(roundService.getRoundsByEventId(eventId,Integer.toUnsignedLong(uid)));

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
    @PostMapping
    public ResponseEntity<?> createRound(@RequestBody RoundRequest request) {
        return ResponseEntity.ok(roundService.createOrUpdateRounds(request));
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


    /**
     * API : Lấy danh sách toàn bộ vòng thi của một Sự kiện (Event) cụ thể
     * URL: GET /api/v1/events/{eventId}/rounds
     */
    @GetMapping("/events/{eventId}/rounds")
    public ResponseEntity<?> getRoundsByEvent(@RequestHeader("Authorization") String auth,@PathVariable long eventId) {
        Integer uid=getUid(auth);
        if (getUid(auth) == null) return unauthorized();

        try {
            List<RoundDetailsResponse> rounds = roundService.getRoundsByEventId(eventId,uid);
            // Trả về danh sách (Mảng rỗng [] nếu Sự kiện chưa được cấu hình vòng thi nào)
            return ResponseEntity.ok(rounds);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Đã xảy ra lỗi hệ thống khi lấy danh sách vòng thi: " + e.getMessage());
        }
    }

    /**
     * API : Xem thông tin chi tiết của một Vòng thi cụ thể dựa theo ID
     * URL: GET /api/v1/rounds/{roundId}
     */
    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<?> getRoundDetailsById(@RequestHeader("Authorization") String auth,@PathVariable long roundId) {
        Integer uid=getUid(auth);
        if (getUid(auth) == null) return unauthorized();
        try {
            RoundDetailsResponse roundDetails = roundService.getRoundDetailsById(roundId,Integer.toUnsignedLong(uid));
            return ResponseEntity.ok(roundDetails);
        } catch (IllegalArgumentException e) {
            // Trả về 404 nếu truyền sai roundId không tồn tại trong hệ thống
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Đã xảy ra lỗi hệ thống khi lấy chi tiết vòng thi: " + e.getMessage());
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
 // nay de lay danh sach teambyround ;
    @GetMapping("/{roundId}/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<ViewTeamListRespone>>
    getTeamsByRound(
            @PathVariable Long roundId
    ) {
        return ResponseEntity.ok(
                teamService.viewTeamByRound(roundId)
        );
    }

    //get round info
    @GetMapping("/{roundId}/info")
    public ResponseEntity<RoundInfoResponseDTO> getRoundInfo(@PathVariable Long roundId) {
        RoundInfoResponseDTO response = roundService.getRoundInfo(roundId);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{roundId}/my-context")
    public ResponseEntity<?> getMyContext(@PathVariable Long roundId,@RequestHeader("Authorization") String auth) {


        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        boolean isMentor = false; // Nếu User này là Lecturer/Mentor thì set true, Thí sinh thì set false

        MyContextResponseDTO response = teamResultService.getMyContext(roundId, Integer.toUnsignedLong(uid));
        return ResponseEntity.ok(response);
    }
}
