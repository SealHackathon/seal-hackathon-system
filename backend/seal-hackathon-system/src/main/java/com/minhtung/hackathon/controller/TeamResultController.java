package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.response.TeamResultResponse;
import com.minhtung.hackathon.enums.RankingScope;
import com.minhtung.hackathon.repository.TeamResultRepository;
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
}
