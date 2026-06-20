package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.JudgeAssignmentRequest;
import com.minhtung.hackathon.entity.JudgeAssignment;
import com.minhtung.hackathon.entity.Track;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.repository.JudgeAssignmentRepository;
import com.minhtung.hackathon.repository.MentorAssignmentRepository;
import com.minhtung.hackathon.repository.TrackRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JudgeAssignmentService {

    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;

    @Transactional
    public JudgeAssignment assignJudge(JudgeAssignmentRequest request) {
        // 1. Kiểm tra xem đã làm Judge của Track này chưa
        if (judgeAssignmentRepository.existsByTrackIdAndUserId(request.getTrackId(), request.getJudgeId())) {
            throw new RuntimeException("Người này đã được phân công làm Giám khảo vào nhánh đấu này rồi!");
        }

        // 2. CHẶN: Kiểm tra xem người này có đang làm Mentor cho chính Track này không
        if (mentorAssignmentRepository.existsByTrackIdAndUserId(request.getTrackId(), request.getJudgeId())) {
            throw new RuntimeException("Không thể phân công: Thành viên này đã là Mentor của nhánh đấu này!");
        }

        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Track với ID: " + request.getTrackId()));

        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giám khảo với ID: " + request.getJudgeId()));

        // Sử dụng Constructor chuẩn của bạn (Bỏ tham số ID giả)
        JudgeAssignment assignment = new JudgeAssignment(track, judge);
        return judgeAssignmentRepository.save(assignment);
    }

    public List<JudgeAssignment> getJudgesByTrack(Long trackId) {
        return judgeAssignmentRepository.findByTrackId(trackId);
    }

    @Transactional
    public void removeAssignment(Long id) {
        JudgeAssignment assignment = judgeAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu phân công với ID: " + id));
        judgeAssignmentRepository.delete(assignment);
    }
}