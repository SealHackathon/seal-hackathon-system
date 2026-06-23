package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.BulkInviteRequest;
import com.minhtung.hackathon.dto.request.MentorJudgeRequest;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.entity.SystemRequest.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MentorJudgeService {

    private final SystemRequestRepository  systemRequestRepo;
    private final MentorAssignmentRepository mentorAssignmentRepo;
    private final JudgeAssignmentRepository  judgeAssignmentRepo;
    private final UserRepository  userRepo;
    private final TrackRepository trackRepo;
    private final EventRepository eventRepo;

    @Transactional
    public void saveMentorsAndJudges(MentorJudgeRequest request) {
        Event event = eventRepo.findById(request.getEventId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event: " + request.getEventId()));

        // Xóa assignment cũ
        mentorAssignmentRepo.deleteByEventId(event.getId());
        judgeAssignmentRepo.deleteByEventId(event.getId());

        // Xóa system_request cũ của event này
        systemRequestRepo.deleteByReferenceIdAndReferenceType(event.getId(), ReferenceType.EVENT);

        // ── Lưu Mentors
        if (request.getMentors() != null) {
            for (MentorJudgeRequest.MentorItem item : request.getMentors()) {
                User receiver = userRepo.findById(item.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User: " + item.getUserId()));

                // 1. Lưu assignment
                Track track = item.getTrackId() != null
                    ? trackRepo.findById(item.getTrackId()).orElse(null)
                    : null;
                mentorAssignmentRepo.save(new MentorAssignment(track, receiver));

                // 2. Lưu system_request
                SystemRequest req = new SystemRequest();
                req.setReceiver(receiver);
                req.setReferenceId(event.getId());
                req.setReferenceType(ReferenceType.EVENT);
                req.setType(RequestType.MENTOR_INVITE);
                req.setStatus(RequestStatus.PENDING);
                systemRequestRepo.save(req);
            }
        }

        // ── Lưu Judges
        if (request.getJudges() != null) {
            for (MentorJudgeRequest.JudgeItem item : request.getJudges()) {
                User receiver = userRepo.findById(item.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User: " + item.getUserId()));

                // 1. Lưu assignment — 1 row per track
                if (item.getTrackIds() != null && !item.getTrackIds().isEmpty()) {
                    for (Long trackId : item.getTrackIds()) {
                        Track track = trackRepo.findById(trackId).orElse(null);
                        judgeAssignmentRepo.save(new JudgeAssignment(track, receiver));
                    }
                } else {
                    judgeAssignmentRepo.save(new JudgeAssignment(null, receiver));
                }

                // 2. Lưu system_request
                SystemRequest req = new SystemRequest();
                req.setReceiver(receiver);
                req.setReferenceId(event.getId());
                req.setReferenceType(ReferenceType.EVENT);
                req.setType(RequestType.JUDGE_INVITE);
                req.setStatus(RequestStatus.PENDING);
                systemRequestRepo.save(req);
            }
        }
    }

    // Gửi lời mời
    public void sendInvite(long userId, long eventId, RequestType type) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndType(userId, eventId, type)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy request"));

        req.setStatus(RequestStatus.SENT);
        req.setSentAt(LocalDateTime.now());
        systemRequestRepo.save(req);
    }

    // Rút lời mời
    public void withdrawInvite(long userId, long eventId, RequestType type) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndType(userId, eventId, type)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy request"));

        req.setStatus(RequestStatus.PENDING);
        req.setSentAt(null);
        systemRequestRepo.save(req);
    }

    // Gửi lời mời hàng loạt (Thêm vào cuối file MentorJudgeService của bạn)
    @Transactional
    public void sendBulkInvites(BulkInviteRequest request, RequestType type) {
        if (request.getIds() == null || request.getIds().isEmpty()) {
            return;
        }

        for (Long userId : request.getIds()) {
            systemRequestRepo.findByReceiver_IdAndReferenceIdAndType(userId, request.getEventId(), type)
                    .ifPresent(req -> {
                        req.setStatus(RequestStatus.SENT);
                        req.setSentAt(LocalDateTime.now());
                        systemRequestRepo.save(req);
                    });
        }
    }
}