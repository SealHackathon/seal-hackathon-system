package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.HandleViolationRequestDto;
import com.minhtung.hackathon.dto.response.ViolationResponseDto;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.TeamStatus;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemRequestService {
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final SystemRequestRepository systemRequestRepository;
    private final TeamResultRepository teamResultRepository;
    private final TeamRepository teamRepository;
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


    @Transactional
    public void handleViolation(Long requestId, HandleViolationRequestDto dto) {
        // 1. Tìm SystemRequest vi phạm
        SystemRequest request = systemRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu vi phạm id: " + requestId));

        if (request.getType() != SystemRequest.RequestType.FLAG_VIOLATION) {
            throw new RuntimeException("Yêu cầu này không phải là báo cáo vi phạm!");
        }

        if (request.getStatus() != SystemRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Yêu cầu này đã được xử lý trước đó!");
        }

        // 2. Cập nhật thông tin xử lý vào SystemRequest
        request.setStatus(dto.getStatus()); // DTO đã là Enum nên gán trực tiếp
        request.setHandleMessage(dto.getHandleMessage());
        request.setUpdatedAt(LocalDateTime.now());
        systemRequestRepository.save(request);

        // 3. Nếu ACCEPTED (Loại đội thi) -> set isPassed = false
        // ✅ So sánh Enum bằng == hoàn toàn chính xác trong Java!
        if (dto.getStatus() == SystemRequest.RequestStatus.ACCEPTED) {
            Submission submission = submissionRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Bài nộp (Submission) tương ứng"));

            if (submission.getTeam() == null) {
                throw new RuntimeException("Bài nộp không gắn với Đội thi nào");
            }

            Long teamId = submission.getTeam().getId();
            Long roundId = request.getRoundId();
            Team team=teamRepository.findById(teamId).orElse(null);
            if (team == null) {
                throw new IllegalArgumentException("Team Not found");
            }
            team.setStatus(TeamStatus.BANNED);
            // Tìm TeamResult của Đội trong Vòng thi đó
            TeamResult teamResult = teamResultRepository.findByTeamIdAndRoundId(teamId, roundId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả (TeamResult) của đội trong vòng thi này"));

            // Đánh dấu rớt/loại
            teamResult.setPassed(false);
            teamResult.setUpdatedAt(LocalDateTime.now());
            teamResultRepository.save(teamResult);
        }
    }
}