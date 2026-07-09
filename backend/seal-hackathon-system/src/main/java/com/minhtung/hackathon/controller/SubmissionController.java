package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.request.SubmissionRequest;
import com.minhtung.hackathon.dto.response.SubmissionDetailResponseid;
import com.minhtung.hackathon.dto.response.SubmissionListResponse;
import com.minhtung.hackathon.dto.response.SubmissionResponse;
import com.minhtung.hackathon.dto.response.ViewSubmissionTrackResponse;
import com.minhtung.hackathon.service.SubmissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/submission")
@RequiredArgsConstructor
public class SubmissionController {
   private final SubmissionService submissionService ;



    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubmissionResponse> submit(
            Authentication authentication,

            @RequestParam("roundId") Long roundId,
            @RequestParam("githUrl") String githUrl,
            @RequestParam(value = "demoUrl", required = false) String demoUrl,
            @RequestParam(value = "documentUrl", required = false) String documentUrl,

            @RequestPart(value = "demoFile", required = false)
            MultipartFile demoFile,

            @RequestPart(value = "documentFile", required = false)
            MultipartFile documentFile
    ) {
        SubmissionRequest request = new SubmissionRequest();
        request.setRoundId(roundId);
        request.setGithUrl(githUrl);
        request.setDemoUrl(demoUrl);
        request.setDocumentUrl(documentUrl);

        SubmissionResponse response =
                submissionService.sumbit(
                        authentication.getName(),
                        request,
                        demoFile,
                        documentFile
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @PutMapping(value = "/updateSumssion/{submissionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            Authentication authentication,

            @PathVariable("submissionId") Long submissionId,
            @RequestParam("githUrl") String githUrl,
            @RequestParam(value = "demoUrl", required = false) String demoUrl,
            @RequestParam(value = "documentUrl", required = false) String documentUrl,

            @RequestPart(value = "demoFile", required = false)
            MultipartFile demoFile,

            @RequestPart(value = "documentFile", required = false)
            MultipartFile documentFile
    ) {
        SubmissionRequest request = new SubmissionRequest();
        request.setGithUrl(githUrl);
        request.setDemoUrl(demoUrl);
        request.setDocumentUrl(documentUrl);

        SubmissionResponse response =
                submissionService.updateSubmission(
                        authentication.getName(),
                        submissionId,
                        request,
                        demoFile,
                        documentFile
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewSubmissionRound")
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


