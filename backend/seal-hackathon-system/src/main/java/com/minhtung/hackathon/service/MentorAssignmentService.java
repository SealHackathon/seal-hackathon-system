package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.MentorAssignmentRequest;
import com.minhtung.hackathon.entity.MentorAssignment;
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
public class MentorAssignmentService {

    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;

    @Transactional
    public MentorAssignment assignMentor(MentorAssignmentRequest request) {
        // 1. Kiểm tra xem đã làm Mentor của Track này chưa
        if (mentorAssignmentRepository.existsByTrackIdAndUserId(request.getTrackId(), request.getMentorId())) {
            throw new RuntimeException("Người này đã được phân công làm Mentor cho nhánh đấu này rồi!");
        }

        // 2. CHẶN: Kiểm tra xem người này có đang làm Giám khảo của chính Track này không
        if (judgeAssignmentRepository.existsByTrackIdAndUserId(request.getTrackId(), request.getMentorId())) {
            throw new RuntimeException("Không thể phân công: Thành viên này đã là Giám khảo của nhánh đấu này!");
        }

        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Track với ID: " + request.getTrackId()));

        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Mentor với ID: " + request.getMentorId()));

        // Sử dụng Constructor 2 tham số chuẩn của bạn
        MentorAssignment assignment = new MentorAssignment(track, mentor);
        return mentorAssignmentRepository.save(assignment);
    }

    public List<MentorAssignment> getMentorsByTrack(Long trackId) {
        return mentorAssignmentRepository.findByTrackId(trackId);
    }

    @Transactional
    public void removeAssignment(Long id) {
        MentorAssignment assignment = mentorAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu phân công với ID: " + id));
        mentorAssignmentRepository.delete(assignment);
    }
}