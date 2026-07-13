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


    @PostMapping("/{roundId}/publish/stage/{stage}")
    public RoundResultResponse publicResult(
            @PathVariable Long roundId,
            @PathVariable Integer stage,
            @RequestParam(required = false) Long trackId) {

        // Gọi hàm service mới xử lý cho cả 2 trường hợp (1 track hoặc tất cả track)
        return roundResultService.updatePublishStage(roundId, trackId, stage);
    }
}