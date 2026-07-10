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
    public RoundResultResponse getRoundResults(@PathVariable Long roundId) {
        return roundResultService.getRoundResults(roundId);
    }
}