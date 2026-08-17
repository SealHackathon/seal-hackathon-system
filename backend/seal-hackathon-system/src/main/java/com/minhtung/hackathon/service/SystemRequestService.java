package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.ViolationResponseDto;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.Submission;
import com.minhtung.hackathon.entity.SystemRequest;
import com.minhtung.hackathon.repository.RoundRepository;
import com.minhtung.hackathon.repository.SubmissionRepository;
import com.minhtung.hackathon.repository.SystemRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemRequestService {
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final SystemRequestRepository systemRequestRepository;

    public List<ViolationResponseDto> getPendingViolations() {
        List<SystemRequest> requests = systemRequestRepository.findByTypeAndStatus(
                SystemRequest.RequestType.FLAG_VIOLATION,
                SystemRequest.RequestStatus.PENDING
        );

        return requests.stream().map(req -> {
            // 1. Lấy thông tin bài nộp để lấy Tên Đội
            Submission submission = submissionRepository.findById(req.getReferenceId()).orElse(null);
            String teamName = (submission != null && submission.getTeam() != null)
                    ? submission.getTeam().getName()
                    : "Đội #" + req.getReferenceId();

            // 2. Dùng RoundRepository để lấy Tên Vòng từ req.getRoundId()
            String roundName = "Chưa xác định";

                roundName = roundRepository.findById(req.getRoundId())
                        .map(Round::getName) // Hoặc getRoundName() tùy field trong Entity Round của bạn
                        .orElse("Vòng " + req.getRoundId());


            return ViolationResponseDto.builder()
                    .id(req.getId())
                    .submissionId(req.getReferenceId())
                    .teamName(teamName)
                    .round(roundName)
                    .judgeName(req.getSender() != null ? req.getSender().getFullName() : "N/A")
                    .time(req.getSentAt())
                    .reason(req.getMessage())
                    .build();
        }).collect(Collectors.toList());
    }
}