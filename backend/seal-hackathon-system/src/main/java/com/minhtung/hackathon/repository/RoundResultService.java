package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.dto.result.RoundResultResponse;

public interface RoundResultService {
    RoundResultResponse getRoundResults(Long roundId, Long trackId);
}