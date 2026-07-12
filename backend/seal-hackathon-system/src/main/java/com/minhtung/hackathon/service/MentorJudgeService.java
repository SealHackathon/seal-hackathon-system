package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.BulkJudgeInviteRequest;
import com.minhtung.hackathon.dto.request.BulkMentorInviteRequest;
import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.entity.SystemRequest.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorJudgeService {

    private final SystemRequestRepository systemRequestRepo;
    private final MentorAssignmentRepository mentorAssignmentRepo;
    private final JudgeAssignmentRepository judgeAssignmentRepo;
    private final UserRepository userRepo;
    private final TrackRepository trackRepo;
    private final EventRepository eventRepo;
    private final RoundTimelineRepository roundTimelineRepository;
    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final RoundRepository roundRepo;
    private final SubmissionRepository submissionRepository;

    private final List<RequestStatus> activeStatuses = List.of(RequestStatus.PENDING, RequestStatus.ACCEPTED);
    private static final DateTimeFormatter HHmm = DateTimeFormatter.ofPattern("HH:mm");

    // ==========================================
    // HELPER VALIDATION BUSINESS RULES
    // ==========================================

    private boolean isUserAlreadyMentorInTrack(long userId, long eventId, long trackId) {
        return systemRequestRepo.existsByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatusIn(
                userId, eventId, trackId, RequestType.MENTOR_INVITE, activeStatuses);
    }

    private boolean isUserAlreadyJudgeInTrack(long userId, long eventId, long trackId) {
        return systemRequestRepo.existsByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatusIn(
                userId, eventId, trackId, RequestType.JUDGE_INVITE, activeStatuses);
    }

    // ==========================================
    // MENTOR INVITE REGION
    // ==========================================

    public void sendInvite(long userId, long eventId, long trackId) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Mentor không tồn tại"));

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        if (isUserAlreadyJudgeInTrack(userId, eventId, trackId)) {
            throw new RuntimeException("Không thể mời! Người này đã hoặc đang là Ban giám khảo cho Track này.");
        }

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

    public void withdrawInvite(long userId, long eventId, long trackId) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatus(userId, eventId, trackId, RequestType.MENTOR_INVITE, RequestStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời Mentor phù hợp để rút!"));

        req.setStatus(RequestStatus.WITHDRAW);
        req.setSentAt(null);
        systemRequestRepo.save(req);
    }

    @Transactional
    public void sendBulkInvites(BulkMentorInviteRequest request) {
        if (request.getIds() == null || request.getIds().isEmpty()) return;

        eventRepo.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        for (Long userId : request.getIds()) {
            User receiver = userRepo.findById(userId).orElse(null);
            if (receiver == null) continue;

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
    // JUDGE INVITE REGION
    // ==========================================

    public void sendJudgeInvite(long userId, long eventId, long trackId, long roundId) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Judge không tồn tại"));

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        if (isUserAlreadyMentorInTrack(userId, eventId, trackId)) {
            throw new RuntimeException("Không thể mời! Người này đã hoặc đang là Mentor cho Track này.");
        }

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

    public void withdrawJudgeInvite(long userId, long eventId, long trackId, long roundId) {
        SystemRequest req = systemRequestRepo
                .findByReceiver_IdAndReferenceIdAndTrackIdAndRoundIdAndTypeAndStatus(userId, eventId, trackId, roundId, RequestType.JUDGE_INVITE, RequestStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời Ban giám khảo để rút!"));

        req.setStatus(RequestStatus.WITHDRAW);
        req.setSentAt(null);
        systemRequestRepo.save(req);
    }

    @Transactional
    public void sendBulkJudgeInvites(BulkJudgeInviteRequest request) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) return;

        eventRepo.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

        for (Long userId : request.getUserIds()) {
            User receiver = userRepo.findById(userId).orElse(null);
            if (receiver == null) continue;

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

    // ==========================================
    // INVITATION MANAGEMENT REGION
    // ==========================================

    public List<InvitationResponseDTO> getPendingInvitationsForUser(long userId) {
        List<SystemRequest> requests = systemRequestRepo.findByReceiverIdAndStatus(userId, RequestStatus.PENDING);

        return requests.stream().map(request -> {
            String trackName = null;
            String roundName = null;
            String eventName = null;
            String eventDescription = null;
            String scope = "";

            if (request.getTrackId() > 0) {
                trackName = trackRepo.findById(request.getTrackId()).map(Track::getName).orElse(null);
            }
            if (request.getRoundId() > 0) {
                roundName = roundRepo.findById(request.getRoundId()).map(Round::getName).orElse(null);
            }
            if (request.getReferenceId() > 0) {
                Event event = eventRepo.findById(request.getReferenceId()).orElse(null);
                if (event != null) {
                    eventName = event.getName();
                    eventDescription = event.getDescription();
                }
            }

            String roleTypeMapping = "";
            if (request.getType() == RequestType.JUDGE_INVITE) {
                roleTypeMapping = "judge";
                if (trackName != null && roundName != null) {
                    scope = "Giám khảo Track " + trackName + " — " + roundName;
                } else if (roundName != null) {
                    scope = "Giám khảo " + roundName;
                }
            } else if (request.getType() == RequestType.MENTOR_INVITE) {
                roleTypeMapping = "mentor";
                scope = trackName != null ? "Mentor chuyên môn " + trackName : "Mentor";
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

    @Transactional
    public void acceptInvitation(long requestId, long userId) {
        SystemRequest request = systemRequestRepo.findByIdAndReceiverId(requestId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời hợp lệ"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời này không còn ở trạng thái chờ");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        systemRequestRepo.save(request);

        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Event event = eventRepo.findById(request.getReferenceId()).orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));
        Track track = trackRepo.findById(request.getTrackId()).orElse(null);
        Round round = roundRepo.findById(request.getRoundId()).orElse(null);

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

    // ==========================================
    // MAIN ASSIGNED EVENT DATA RETRIEVAL
    // ==========================================

    public AssignedEventResponseDTO getAssignedEvent(long userId) {
        List<JudgeAssignment> judgeAssignments = judgeAssignmentRepo.findAllByUserIdWithDetails(userId);
        List<MentorAssignment> mentorAssignments = mentorAssignmentRepo.findAllByUserIdWithDetails(userId);

        if (judgeAssignments.isEmpty() && mentorAssignments.isEmpty()) {
            throw new RuntimeException("Bạn chưa được phân công sự kiện.");
        }

        Event eventRef = !judgeAssignments.isEmpty()
                ? judgeAssignments.get(0).getEvent()
                : mentorAssignments.get(0).getEvent();

        Event event = eventRepo.findByIdWithRounds(eventRef.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện."));

        List<Long> roundIds = event.getRounds().stream().map(Round::getId).collect(Collectors.toList());
        List<RoundTimeline> allTimelines = roundIds.isEmpty()
                ? Collections.emptyList()
                : roundTimelineRepository.findByRound_IdIn(roundIds);

        Map<Long, List<RoundTimeline>> timelinesByRoundId = allTimelines.stream()
                .collect(Collectors.groupingBy(rt -> rt.getRound().getId()));

        return AssignedEventResponseDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .theme(event.getTopic())
                .description(event.getDescription())
                .roles(buildRoles(judgeAssignments, mentorAssignments))
                .assignment(buildAssignment(judgeAssignments, mentorAssignments))
                .stats(buildStats(event))
                .currentRound(buildCurrentRound(event.getRounds(), timelinesByRoundId))
                .build();
    }

    private List<String> buildRoles(List<JudgeAssignment> judge, List<MentorAssignment> mentor) {
        List<String> roles = new ArrayList<>();
        if (judge != null && !judge.isEmpty()) roles.add("judge");
        if (mentor != null && !mentor.isEmpty()) roles.add("mentor");
        return roles;
    }

    private AssignmentDTO buildAssignment(List<JudgeAssignment> judgeAssignments, List<MentorAssignment> mentorAssignments) {
        AssignmentDTO.AssignmentDTOBuilder builder = AssignmentDTO.builder();

        if (judgeAssignments != null && !judgeAssignments.isEmpty()) {
            builder.judge(buildJudgeAssignment(judgeAssignments));
        }
        if (mentorAssignments != null && !mentorAssignments.isEmpty()) {
            builder.mentor(buildMentorAssignment(mentorAssignments));
        }
        return builder.build();
    }

    private JudgeAssignmentDTO buildJudgeAssignment(List<JudgeAssignment> judgeAssignments) {
        Map<Long, List<JudgeAssignment>> byRound = judgeAssignments.stream()
                .collect(Collectors.groupingBy(ja -> ja.getRound().getId(), LinkedHashMap::new, Collectors.toList()));

        List<JudgeRoundDTO> rounds = byRound.values().stream().map(group -> {
            Round round = group.get(0).getRound();
            boolean allCategories = group.stream().anyMatch(ja -> ja.getTrack() == null);

            List<String> categories = allCategories
                    ? Collections.emptyList()
                    : group.stream().map(ja -> ja.getTrack().getName()).distinct().collect(Collectors.toList());

            return JudgeRoundDTO.builder()
                    .roundId(round.getId())
                    .name(round.getName())
                    .allCategories(allCategories)
                    .categories(categories)
                    .timeStart(round.getTimeStart())
                    .timeEnd(round.getTimeEnd())
                    .build();
        }).collect(Collectors.toList());

        return JudgeAssignmentDTO.builder().rounds(rounds).build();
    }

    private MentorAssignmentDTO buildMentorAssignment(List<MentorAssignment> mentorAssignments) {
        List<String> categories = mentorAssignments.stream()
                .map(ma -> ma.getTrack().getName())
                .distinct()
                .collect(Collectors.toList());

        String mainCategory = categories.isEmpty() ? "" : categories.get(0);

        List<Track> assignedTracks = mentorAssignments.stream()
                .map(MentorAssignment::getTrack)
                .distinct()
                .collect(Collectors.toList());

        List<Team> assignedTeams = assignedTracks.isEmpty()
                ? Collections.emptyList()
                : teamRepository.findAllByTrackIn(assignedTracks);

        List<MentorRequestDTO> blankRequests = Collections.emptyList();

        return MentorAssignmentDTO.builder()
                .category(mainCategory)
                .categories(categories)
                .milestones(buildMilestonesForMentor(mentorAssignments.get(0).getEvent()))
                .teams(assignedTeams.stream().map(this::mapToMentorTeamDTO).collect(Collectors.toList()))
                .requests(blankRequests)
                .build();
    }

    // ==========================================
    // MENTOR ADAPTER MAPPER (MAPPED WITH REAL TEAM ENTITY)
    // ==========================================

    private MentorTeamDTO mapToMentorTeamDTO(Team team) {
        String statusStr = team.getStatus() != null ? team.getStatus().name().toLowerCase() : "open";
        String leaderName = (team.getLeader() != null) ? team.getLeader().getFullName() : "Chưa có";
        int membersCount = (team.getMembers() != null) ? team.getMembers().size() : 0;

        int totalRounds = 0;
        int doneRounds = 0;

        // 1. Lấy tổng số vòng từ Event của Track
        boolean hasGithub = false;
        boolean hasDemo = false;
        boolean hasDoc = false;
        if (team.getTrack() != null && team.getTrack().getEvent() != null
                && team.getTrack().getEvent().getRounds() != null) {

            totalRounds = team.getTrack().getEvent().getRounds().size();

            // 2. DÙNG REPO: Tìm danh sách nộp bài của riêng Team này
            List<Submission> teamSubmissions = submissionRepository.findByTeamId(team.getId());

            // Tìm bài nộp mới nhất của đội (ở bất kỳ vòng nào hoặc vòng hiện tại) để check link
            hasGithub = false;
            hasDemo = false;
            hasDoc = false;

            if (teamSubmissions != null && !teamSubmissions.isEmpty()) {
                // Lọc ra những bài nộp có tồn tại link tương ứng
                hasGithub = teamSubmissions.stream().anyMatch(sub -> sub.getGithubUrl() != null && !sub.getGithubUrl().isBlank() && sub.isLatest());
                hasDemo = teamSubmissions.stream().anyMatch(sub -> sub.getDemoUrl() != null && !sub.getDemoUrl().isBlank() && sub.isLatest());
                hasDoc = teamSubmissions.stream().anyMatch(sub -> sub.getDocumentUrl() != null && !sub.getDocumentUrl().isBlank() && sub.isLatest());
            }

            if (teamSubmissions != null && !teamSubmissions.isEmpty()) {
                doneRounds = (int) teamSubmissions.stream()
                        .filter(sub -> sub != null && sub.isLatest()) // Chỉ lấy những bản ghi mới nhất của vòng đó
                        .map(sub -> sub.getRound().getId())
                        .distinct()
                        .count();
            }

            if (doneRounds > totalRounds) {
                doneRounds = totalRounds;
            }
        }

        if (totalRounds == 0) {
            totalRounds = 3;
        }

        return MentorTeamDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .leader(leaderName)
                .memberCount(membersCount)
                .leaderPosition("Leader")
                .status(statusStr)
                .stoppedRound(null)
                .rank(0)
                .score(0.0)
                .currentRound(null)
                .progress(TeamProgressDTO.builder()
                        .done(doneRounds)
                        .total(totalRounds)
                        .build())
                .submission(TeamSubmissionDTO.builder().github(hasGithub).video(hasDemo).slide(hasDoc).build())
                .questionsTotal(0)
                .pendingQuestions(0)
                .build();
    }

    private List<MilestoneDTO> buildMilestonesForMentor(Event event) {
        if (event.getRounds() == null) return Collections.emptyList();

        return event.getRounds().stream().map(round ->
                MilestoneDTO.builder()
                        .id(round.getId())
                        .title(round.getName())
                        .date(round.getTimeStart() != null ? round.getTimeStart().toLocalDate().toString() : null)
                        .endDate(round.getTimeEnd() != null ? round.getTimeEnd().toLocalDate().toString() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    // ==========================================
    // STATS & GENERAL ROUND TIMELINE REGION
    // ==========================================

    private EventStatsDTO buildStats(Event event) {
        long teamCount = teamRepository.countByTrack_Event_Id(event.getId());
        long participantCount = memberRepository.countByTeam_Track_Event_Id(event.getId());
        long categoryCount = trackRepo.countByEvent_Id(event.getId());
        int roundCount = event.getRounds().size();

        return EventStatsDTO.builder()
                .teamCount((int) teamCount)
                .participantCount((int) participantCount)
                .categoryCount((int) categoryCount)
                .roundCount(roundCount)
                .build();
    }

    private CurrentRoundDTO buildCurrentRound(List<Round> rounds, Map<Long, List<RoundTimeline>> timelinesByRoundId) {
        if (rounds == null || rounds.isEmpty()) return null;

        List<Round> sortedRounds = rounds.stream()
                .sorted(Comparator.comparingInt(Round::getOrdinal_number))
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();

        Round current = sortedRounds.stream()
                .filter(r -> !now.isBefore(r.getTimeStart()) && !now.isAfter(r.getTimeEnd()))
                .findFirst()
                .orElse(null);

        if (current == null) {
            current = sortedRounds.stream()
                    .filter(r -> r.getTimeStart().isAfter(now))
                    .min(Comparator.comparing(Round::getTimeStart))
                    .orElse(null);
        }

        if (current == null) {
            current = sortedRounds.get(sortedRounds.size() - 1);
        }

        int index = sortedRounds.indexOf(current) + 1;
        List<RoundTimeline> timelines = timelinesByRoundId.getOrDefault(current.getId(), Collections.emptyList());

        return CurrentRoundDTO.builder()
                .id(current.getId())
                .index(index)
                .total(sortedRounds.size())
                .name(current.getName())
                .startTime(current.getTimeStart())
                .endTime(current.getTimeEnd())
                .submissionDeadline(current.getSubmissionDeadline())
                .schedule(buildSchedule(sortedRounds.get(0).getEvent(), timelines))
                .build();
    }

    private List<RoundTimelineDTO> buildSchedule(Event event, List<RoundTimeline> timelines) {
        if (timelines == null || timelines.isEmpty()) return Collections.emptyList();

        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return timelines.stream()
                // Sắp xếp theo chuỗi String thời gian (vì String dạng ISO-8601 sắp xếp vẫn đúng)
                .sorted(Comparator.comparing(RoundTimeline::getTimeStart))
                .map(rt -> {
                    String timeRange = "00:00 - 00:00";

                    try {
                        // Bước 1: Parse từ String trong DB thành LocalDateTime
                        LocalDateTime start = LocalDateTime.parse(rt.getTimeStart());
                        LocalDateTime end = LocalDateTime.parse(rt.getTimeEnd());

                        // Bước 2: Format sang dạng "HH:mm"
                        timeRange = start.format(outputFormatter) + " - " + end.format(outputFormatter);
                    } catch (Exception e) {
                        // Phòng trường hợp chuỗi String trong DB bị sai định dạng không parse được
                        timeRange = rt.getTimeStart() + " - " + rt.getTimeEnd();
                    }

                    return RoundTimelineDTO.builder()
                            .time(timeRange)
                            .title(rt.getName())
                            .desc(rt.getDescription())
                            .build();
                })
                .collect(Collectors.toList());
    }
}