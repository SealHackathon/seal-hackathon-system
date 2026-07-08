package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.BulkJudgeInviteRequest;
import com.minhtung.hackathon.dto.request.BulkMentorInviteRequest;
import com.minhtung.hackathon.dto.request.MentorJudgeRequest;
import com.minhtung.hackathon.dto.response.InvitationResponseDTO;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.entity.SystemRequest.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MentorJudgeService {

    private final SystemRequestRepository systemRequestRepo;
    private final MentorAssignmentRepository mentorAssignmentRepo;
    private final JudgeAssignmentRepository judgeAssignmentRepo;
    private final UserRepository userRepo;
    private final TrackRepository trackRepo;
    private final EventRepository eventRepo;
    private final RoundRepository roundRepo;


    // Trạng thái được coi là đang hoạt động / đã tham gia vào Track
    private final List<RequestStatus> activeStatuses = List.of(RequestStatus.PENDING, RequestStatus.ACCEPTED);

    // ==========================================
    // HELPER VALIDATION BUSINESS RULES
    // ==========================================

    // Check xem User đã/đang là Mentor trong Track này chưa
    private boolean isUserAlreadyMentorInTrack(long userId, long eventId, long trackId) {
        return systemRequestRepo.existsByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatusIn(
                userId, eventId, trackId, RequestType.MENTOR_INVITE, activeStatuses);
    }



    // Check xem User đã/đang là Judge trong Track này chưa
    private boolean isUserAlreadyJudgeInTrack(long userId, long eventId, long trackId) {
        List<SystemRequest.RequestStatus> activeStatuses = List.of(
                SystemRequest.RequestStatus.PENDING,
                SystemRequest.RequestStatus.ACCEPTED
        );

        // Kiểm tra xem có bất kỳ request JUDGE_INVITE nào ở Track này của user đang active không
        return systemRequestRepo.existsByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatusIn(
                userId, eventId, trackId, SystemRequest.RequestType.JUDGE_INVITE, activeStatuses
        );
    }



    // Gửi lời mời lẻ cho 1 Mentor
    public void sendInvite(long userId, long eventId, long trackId) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Mentor không tồn tại"));

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        // [BR]: Nếu người này đang làm Judge ở Track này thì không cho phép mời làm Mentor
        if (isUserAlreadyJudgeInTrack(userId, eventId, trackId)) {
            throw new RuntimeException("Không thể mời! Người này đã hoặc đang là Ban giám khảo cho Track này.");
        }

        // Check trùng lời mời Mentor
        boolean isExist = systemRequestRepo.findByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatus(
                userId, eventId, trackId, RequestType.MENTOR_INVITE, RequestStatus.PENDING).isPresent();
        if (isExist) {
            throw new RuntimeException("Đã gửi lời mời tới Mentor ở track này rồi");
        }

        SystemRequest newRequest = new SystemRequest();
        newRequest.setReceiver(receiver);
        newRequest.setReferenceId(eventId);
        newRequest.setReferenceType(SystemRequest.ReferenceType.EVENT);
        newRequest.setType(RequestType.MENTOR_INVITE);
        newRequest.setStatus(RequestStatus.PENDING);
        newRequest.setTrackId(trackId);
        newRequest.setMessage("Bạn được mời làm mentor cho sự kiện " + event.getName());
        newRequest.setSentAt(LocalDateTime.now());

        systemRequestRepo.save(newRequest);
    }

    // Rút lời mời Mentor
    public void withdrawInvite(long userId, long eventId, long trackId) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatus(userId, eventId, trackId, RequestType.MENTOR_INVITE, RequestStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời Mentor phù hợp để rút!"));

        req.setStatus(RequestStatus.WITHDRAW);
        req.setSentAt(null);
        systemRequestRepo.save(req);
    }

    // Gửi lời mời hàng loạt cho Mentor
    @Transactional
    public void sendBulkInvites(BulkMentorInviteRequest request) {
        if (request.getIds() == null || request.getIds().isEmpty()) return;

        eventRepo.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        for (Long userId : request.getIds()) {
            User receiver = userRepo.findById(userId).orElse(null);
            if (receiver == null) continue;

            // [BR]: Bỏ qua nếu người này đang làm Judge ở Track này
            if (isUserAlreadyJudgeInTrack(userId, request.getEventId(), request.getTrackId())) {
                continue;
            }

            boolean isExist = systemRequestRepo.findByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatus(
                    userId, request.getEventId(), request.getTrackId(), RequestType.MENTOR_INVITE, RequestStatus.PENDING).isPresent();

            if (!isExist) {
                SystemRequest newRequest = new SystemRequest();
                newRequest.setReceiver(receiver);
                newRequest.setReferenceId(request.getEventId());
                newRequest.setReferenceType(SystemRequest.ReferenceType.EVENT);
                newRequest.setType(RequestType.MENTOR_INVITE);
                newRequest.setStatus(RequestStatus.PENDING);
                newRequest.setTrackId(request.getTrackId());
                newRequest.setMessage("Bạn được mời làm mentor cho sự kiện");
                newRequest.setSentAt(LocalDateTime.now());
                systemRequestRepo.save(newRequest);
            }
        }
    }

    // ==========================================
    // JUDGE REGION (New Added)
    // ==========================================

    // Gửi lời mời lẻ cho 1 Judge
    public void sendJudgeInvite(long userId, long eventId, long trackId, long roundId) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Judge không tồn tại"));

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        // [BR]: Nếu người này đang làm Mentor ở Track này thì không cho phép mời làm Judge
        if (isUserAlreadyMentorInTrack(userId, eventId, trackId)) {
            throw new RuntimeException("Không thể mời! Người này đã hoặc đang là Mentor cho Track này.");
        }

        // Check trùng lời mời Judge
        boolean isExist = systemRequestRepo.findByReceiver_IdAndReferenceIdAndTrackIdAndRoundIdAndTypeAndStatus(
                userId, eventId, trackId, roundId, RequestType.JUDGE_INVITE, RequestStatus.PENDING).isPresent();
        if (isExist) {
            throw new RuntimeException("Đã gửi lời mời tới Judge ở round của track này rồi");
        }

        SystemRequest newRequest = new SystemRequest();
        newRequest.setReceiver(receiver);
        newRequest.setReferenceId(eventId);
        newRequest.setReferenceType(SystemRequest.ReferenceType.EVENT);
        newRequest.setType(RequestType.JUDGE_INVITE);
        newRequest.setStatus(RequestStatus.PENDING);
        newRequest.setTrackId(trackId);
        newRequest.setRoundId(roundId);
        newRequest.setMessage("Bạn được mời làm ban giám khảo cho sự kiện " + event.getName());
        newRequest.setSentAt(LocalDateTime.now());

        systemRequestRepo.save(newRequest);
    }
    // Rút lời mời Judge
    public void withdrawJudgeInvite(long userId, long eventId, long trackId, long roundId) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndTrackIdAndRoundIdAndTypeAndStatus(userId, eventId, trackId, roundId, RequestType.JUDGE_INVITE, RequestStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời Ban giám khảo để rút!"));

        req.setStatus(RequestStatus.WITHDRAW);
        req.setSentAt(null);
        systemRequestRepo.save(req);
    }

    // Gửi lời mời hàng loạt cho Judge
    @Transactional
    public void sendBulkJudgeInvites(BulkJudgeInviteRequest request) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) return;

        eventRepo.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        for (Long userId : request.getUserIds()) {
            User receiver = userRepo.findById(userId).orElse(null);
            if (receiver == null) continue;

            // [BR]: Bỏ qua nếu người này đang làm Mentor ở Track này
            if (isUserAlreadyMentorInTrack(userId, request.getEventId(), request.getTrackId())) {
                continue;
            }

            boolean isExist = systemRequestRepo.findByReceiver_IdAndReferenceIdAndTrackIdAndRoundIdAndTypeAndStatus(
                    userId, request.getEventId(), request.getTrackId(), request.getRoundId(), RequestType.JUDGE_INVITE, RequestStatus.PENDING).isPresent();

            if (!isExist) {
                SystemRequest newRequest = new SystemRequest();
                newRequest.setReceiver(receiver);
                newRequest.setReferenceId(request.getEventId());
                newRequest.setReferenceType(SystemRequest.ReferenceType.EVENT);
                newRequest.setType(RequestType.JUDGE_INVITE);
                newRequest.setStatus(RequestStatus.PENDING);
                newRequest.setTrackId(request.getTrackId());
                newRequest.setRoundId(request.getRoundId());
                newRequest.setMessage("Bạn được mời làm ban giám khảo cho sự kiện");
                newRequest.setSentAt(LocalDateTime.now());
                systemRequestRepo.save(newRequest);
            }
        }
    }



    // 1. Lấy danh sách lời mời chờ duyệt
    public List<InvitationResponseDTO> getPendingInvitationsForUser(long userId) {

        List<SystemRequest> requests =
                systemRequestRepo.findByReceiverIdAndStatus(userId, RequestStatus.PENDING);

        return requests.stream().map(request -> {

            String trackName = null;
            String roundName = null;
            String eventName = null;
            String eventDescription = null;
            String scope = "";

            if (request.getTrackId() > 0) {
                trackName = trackRepo.findById(request.getTrackId())
                        .map(Track::getName)
                        .orElse(null);
            }

            if (request.getRoundId() > 0) {
                roundName = roundRepo.findById(request.getRoundId())
                        .map(Round::getName)
                        .orElse(null);
            }

            if (request.getReferenceId() > 0) {

                Event event = eventRepo.findById(request.getReferenceId()).orElse(null);

                if (event != null) {
                    eventName = event.getName();
                    eventDescription = event.getDescription();
                }
            }
            String roleTypeMapping="";

            if (request.getType() == RequestType.JUDGE_INVITE) {
                roleTypeMapping="judge";
                if (trackName != null && roundName != null) {
                    scope = "Giám khảo Track " + trackName + " — " + roundName;
                } else if (roundName != null) {
                    scope = "Giám khảo " + roundName;
                }

            } else if (request.getType() == RequestType.MENTOR_INVITE) {
                roleTypeMapping="mentor";
                if (trackName != null) {
                    scope = "Mentor chuyên môn " + trackName;
                } else {
                    scope = "Mentor";
                }
            }

            return InvitationResponseDTO.builder()
                    .id(request.getId())
                    .roleType(roleTypeMapping)
                    .eventName(eventName)
                    .trackName(trackName)
                    .roundName(roundName)
                    .scope(scope)
                    .eventDescription(eventDescription)
                    .message(request.getMessage())
                    .build();

        }).toList();
    }


    // 2. Chấp nhận lời mời
    @Transactional
    public void acceptInvitation(long requestId, long userId) {
        SystemRequest request = systemRequestRepo.findByIdAndReceiverId(requestId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời hợp lệ"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời này không còn ở trạng thái chờ");
        }

        // 1. Cập nhật trạng thái request
        request.setStatus(RequestStatus.ACCEPTED);
        systemRequestRepo.save(request);

        // 2. Dùng Repo để tìm kiếm Entity (Sẽ phát sinh lệnh SELECT)
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Event event = eventRepo.findById(request.getReferenceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        Track track = trackRepo.findById(request.getTrackId()).orElse(null);

        Round round=roundRepo.findById(request.getRoundId()).orElse(null);

        // 3. Tạo và gán trực tiếp
        if (request.getType() == RequestType.MENTOR_INVITE) {
            MentorAssignment mentorAssignment = new MentorAssignment();
            mentorAssignment.setTrack(track);
            mentorAssignment.setUser(user);
            mentorAssignment.setEvent(event);
            mentorAssignmentRepo.save(mentorAssignment);

        } else if (request.getType() == RequestType.JUDGE_INVITE) {
            JudgeAssignment judgeAssignment = new JudgeAssignment();
            judgeAssignment.setTrack(track);
            judgeAssignment.setUser(user);
            judgeAssignment.setEvent(event);
            judgeAssignment.setRound(round);
            judgeAssignmentRepo.save(judgeAssignment);
        }
    }

    // 3. Từ chối lời mời
    @Transactional
    public void rejectInvitation(long requestId, long userId) {
        SystemRequest request = systemRequestRepo.findByIdAndReceiverId(requestId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời hợp lệ"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời này không còn ở trạng thái chờ");
        }

        request.setStatus(RequestStatus.REJECTED);
        systemRequestRepo.save(request);
    }

}