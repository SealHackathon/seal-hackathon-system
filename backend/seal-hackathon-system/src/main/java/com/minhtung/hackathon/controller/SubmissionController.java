package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.SubmissionRequest;
import com.minhtung.hackathon.dto.request.UpdateSubmissionRequest;
import com.minhtung.hackathon.dto.response.SubmissionDetailResponseid;
import com.minhtung.hackathon.dto.response.SubmissionListResponse;
import com.minhtung.hackathon.dto.response.SubmissionResponse;
import com.minhtung.hackathon.dto.response.ViewSubmissionTrackResponse;
import com.minhtung.hackathon.service.SubmissionService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/submission")
@RequiredArgsConstructor
public class SubmissionController {
   private final SubmissionService submissionService ;


    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<SubmissionResponse> submit(
            Authentication authentication,
            @Valid @RequestBody SubmissionRequest request
    ) {
        SubmissionResponse response =
                submissionService.sumbit(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            Authentication authentication,
            @PathVariable("id") Long submissionId,
            @RequestBody UpdateSubmissionRequest request
    ) {
        SubmissionResponse response =
                submissionService.updateSubmission(
                        authentication.getName(),
                        submissionId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<SubmissionListResponse>>
    getSubmissionsByRound(
            @RequestParam Long roundId
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissionByRound(roundId)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<SubmissionDetailResponseid>
    getSubmissionById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                submissionService.getSubmissionById(id)
        );
    }

    @GetMapping("/track/{trackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<ViewSubmissionTrackResponse>>
    getSubmissionsByTrack(
            @PathVariable Long trackId
    ) {
        return ResponseEntity.ok(
                submissionService.viewSubmissionTrackResponses(trackId)
        );
    }
}


