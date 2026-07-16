package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.response.TeamResultResponse;
import com.minhtung.hackathon.dto.response.TeamRoundResultDTO;
import com.minhtung.hackathon.dto.response.TeamRoundResultLecturerDTO;
import com.minhtung.hackathon.enums.RankingScope;
import com.minhtung.hackathon.repository.TeamResultRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.TeamResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-results")
@RequiredArgsConstructor
public class TeamResultController {
    private  final TeamResultService teamResultService ;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    @GetMapping(
            "/tracks/{trackId}/rounds/{roundId}"
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamResultResponse>>
    getTrackRanking(
            @PathVariable Long trackId,
            @PathVariable Long roundId
    ) {
        return ResponseEntity.ok(
                teamResultService.getTrackRanking(
                        trackId,
                        roundId
                )
        );
    }
    @GetMapping("/rounds/{roundId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamResultResponse>>
    getRoundRanking(
            @PathVariable Long roundId
    ) {
        return ResponseEntity.ok(
                teamResultService.getRoundRanking(roundId)
        );
    }
    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamResultResponse>>
    getEventRanking(
            @PathVariable Long eventId
    ) {
        return ResponseEntity.ok(
                teamResultService.getEventRanking(eventId)
        );
    }
    @PostMapping(
            "/tracks/{trackId}/rounds/{roundId}/publish"
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> publishTrackResults(
            @PathVariable Long trackId,
            @PathVariable Long roundId
    ) {
        teamResultService.publishTrackResults(
                trackId,
                roundId
        );

        return ResponseEntity.ok(
                "Công bố kết quả thành công"
        );
    }
    @GetMapping("/public")
    public ResponseEntity<List<TeamResultResponse>>
    getPublicRanking(
            @RequestParam RankingScope scope,
            @RequestParam Long id,
            @RequestParam(required = false)
            Long roundId
    ) {
        return ResponseEntity.ok(
                teamResultService.getPublicRanking(
                        scope,
                        id,
                        roundId
                )
        );
    }


    @GetMapping("/round-results")
    public ResponseEntity<?> getTeamRoundResults(
            @RequestParam("eventId") Long eventId,
            // Giả định bạn dùng Spring Security để lấy thông tin User/Team đang đăng nhập
            @RequestHeader("Authorization") String auth
    ) {
        // Lấy teamId của tài khoản đang đăng nhập
        Integer uid = getUid(auth);
        if (uid == null) {
            return unauthorized();
        }

        List<TeamRoundResultDTO> results = teamResultService.getTeamResultsByEvent(Integer.toUnsignedLong(uid), eventId);
        return ResponseEntity.ok(results);
    }

    //lấy thông tin result cho mentor
    @GetMapping("/events/{eventId}/teams/{teamId}/results")
    public List<TeamRoundResultLecturerDTO> getTeamResults(
            @PathVariable Long eventId,
            @PathVariable Long teamId) {
        return teamResultService.getTeamResultsByTeamId(teamId, eventId);
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
