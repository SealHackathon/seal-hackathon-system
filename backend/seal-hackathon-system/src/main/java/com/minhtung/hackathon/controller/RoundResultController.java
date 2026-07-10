package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.result.*;
import com.minhtung.hackathon.repository.RoundResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/round")
@RequiredArgsConstructor
public class RoundResultController {

    private final RoundResultService roundResultService;

    @GetMapping("/{roundId}/results")
    public RoundResultResponse getRoundResults(@PathVariable Long roundId,
                                               @RequestParam(required = false) Long trackId) {

        return roundResultService.getRoundResults(roundId, trackId);

    }


    @PostMapping("/{roundId}/track/{trackId}/publish/stage/{stage}")
    public RoundResultResponse publicResult(
            @PathVariable Long roundId,
            @PathVariable Long trackId,
            @PathVariable Integer stage) { // Đổi từ Long sang Integer

        return roundResultService.updatePublishStage(roundId, trackId, stage);
    }
}