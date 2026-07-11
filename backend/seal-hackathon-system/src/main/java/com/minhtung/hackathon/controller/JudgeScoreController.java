package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.JudgeScoreRequest;
import com.minhtung.hackathon.dto.request.UpdateJudgeScoreRequest;
import com.minhtung.hackathon.dto.response.JudgeScoreResponse;
import com.minhtung.hackathon.service.JudgeScoreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/judge-scores")
@RequiredArgsConstructor
public class JudgeScoreController {
    private final JudgeScoreService judgeScoreService;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<JudgeScoreResponse> create(
            Authentication authentication,
            @Valid @RequestBody JudgeScoreRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        judgeScoreService.createScore(
                                authentication.getName(),
                                request
                        )
                );
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<JudgeScoreResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateJudgeScoreRequest request
    ) {
        return ResponseEntity.ok(
                judgeScoreService.updateScore(
                        authentication.getName(),
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        judgeScoreService.deleteScore(
                authentication.getName(),
                id
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<JudgeScoreResponse>>
    getMyScores(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                judgeScoreService.getMyScores(
                        authentication.getName()
                )
        );
    }
}
