package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.SubmissionRequest;
import com.minhtung.hackathon.dto.request.UpdateSubmissionRequest;
import com.minhtung.hackathon.dto.response.SubmissionDetailResponseid;
import com.minhtung.hackathon.dto.response.SubmissionListResponse;
import com.minhtung.hackathon.dto.response.SubmissionResponse;
import com.minhtung.hackathon.dto.response.ViewSubmissionTrackResponse;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    @Value("${submission.demo.max-size}")
    private DataSize maxDemoSize;

    @Value("${submission.document.max-size}")
    private DataSize maxDocumentSize;

    @Transactional
    public SubmissionResponse sumbit(String email, SubmissionRequest request, MultipartFile demoFile, MultipartFile documentFile) {
        //kiem tra co tai khoan chua
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException(" ban chua dang ki tk"));
        //check xem chi leader moi duoc nop bai
        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER, MemberStatus.OFFICAL).orElseThrow(() ->
                new IllegalArgumentException(
                        "Chỉ trưởng nhóm được phép nộp bài"
                ));
        // tim kiem co round nay khong
        Team team = leader.getTeam();
        Round round = roundRepository.findById(request.getRoundId()).orElseThrow(() -> new RuntimeException("khong tìm thấy vòng thi này"));


        //check xem team co thuoc round nay khong
        validateTeamAndRound(team, round);
        //nay la check xem den thoi gian nop hay het han nop
        validateSumssion(round);
        String githubUrl = normalize(request.getGithUrl());
        String demoUrl = normalize(request.getDemoUrl());
        String documentUrl = normalize(request.getDocumentUrl());


        //link github la bat buoc
        if (!hasText(githubUrl)) {
            throw new RuntimeException("Link gihthub la bat buoc");
        }
        boolean hasDemoFile =
                demoFile != null && !demoFile.isEmpty();

        boolean hasDocumentFile =
                documentFile != null && !documentFile.isEmpty();

        if (!hasText(demoUrl) && !hasDemoFile) {
            throw new RuntimeException("phai nop link hoac file video demo");
        }
        if (!hasText(documentUrl) && !hasDocumentFile) {
            throw new RuntimeException("phai nop link hoac file slide demo");
        }
        if (hasDemoFile) {
            validateDemoFile(demoFile);

            demoUrl = cloudinaryStorageService
                    .uploadSubmissionFile(
                            demoFile,
                            team.getId(),
                            round.getId(),
                            "video"
                    );
        }
        if (hasDocumentFile) {
            validateDocumentFile(documentFile);

            documentUrl = cloudinaryStorageService
                    .uploadSubmissionFile(
                            documentFile,
                            team.getId(),
                            round.getId(),
                            "raw"
                    );
        }
        submissionRepository
                .findFirstByTeamIdAndRoundIdAndLatestTrue(
                        team.getId(),
                        round.getId()
                )
                .ifPresent(oldSubmission ->
                        oldSubmission.setLatest(false)
                );
        Submission submission = new Submission();
        submission.setTeam(team);
        submission.setRound(round);
        submission.setGithubUrl(githubUrl);
        submission.setDemoUrl(demoUrl);
        submission.setDocumentUrl(documentUrl);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setLatest(true);

        return SubmissionResponse.from(
                submissionRepository.save(submission), new ArrayList<>(),1);
    }

    @Transactional
    public SubmissionResponse updateSubmission(String email, Long roundId, UpdateSubmissionRequest request) {
        validateSubmittionLinks(request);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException(" ban chua dang ki tk"));

        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER, MemberStatus.OFFICAL).orElseThrow(() ->
                new IllegalArgumentException(
                        "Chỉ trưởng nhóm được phép nộp bài"
                ));
        // tim kiem co round nay khong
        Team team = leader.getTeam();
        Round round = roundRepository.findById(roundId).orElseThrow(() -> new RuntimeException("khong tìm thấy vòng thi này"));
        validateTeamAndRound(team, round);
        validateSumssion(round);

        //khuc nay de tim bai nop cu de update
        Submission oldSubmission = submissionRepository
                .findFirstByTeamIdAndRoundIdAndLatestTrue(
                        team.getId(),
                        roundId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Nhóm chưa có bài nộp để cập nhật"
                        )
                );
        oldSubmission.setLatest(false);
        submissionRepository.save(oldSubmission);
        Submission newSubmission = new Submission();
        newSubmission.setTeam(team);
        newSubmission.setRound(round);
        newSubmission.setGithubUrl(normalize(request.getGithubUrl()));
        ;
        ;
        newSubmission.setDemoUrl(normalize(request.getDemoUrl()));
        newSubmission.setDocumentUrl(normalize(request.getDocumentUrl()));
        newSubmission.setSubmittedAt(LocalDateTime.now());
        newSubmission.setLatest(true);

        return SubmissionResponse.from(submissionRepository.save(newSubmission), new ArrayList<>(),1);
    }


    @Transactional(readOnly = true)
    public List<SubmissionListResponse> getSubmissionByRound(String email, Long roundId) {
        if (!roundRepository.existsById(roundId)) {
            throw new RuntimeException("Không tìm thấy vòng thi");
        }

        // 1. Tìm thông tin Giám khảo đang đăng nhập
        User judge = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản giám khảo"));

        boolean hasAssignmentInRound = judgeAssignmentRepository.existsByUser_IdAndRoundId(judge.getId(), roundId);

        if (!hasAssignmentInRound) {
            throw new RuntimeException("Bạn không được phân công nhiệm vụ chấm điểm tại vòng thi này.");
        }

        // 2. Lấy danh sách các bài nộp mới nhất của vòng
        List<Submission> submissions =
                submissionRepository.findSubmissionForJudge(judge.getId(), roundId);

        // 3. Map từng bài nộp kèm theo bộ lọc điểm số của riêng giám khảo này
        return submissions.stream().map(submission -> {
            Long trackId = submission.getTeam().getTrack() != null ? submission.getTeam().getTrack().getId() : null;
            Optional<JudgeScore> judgeScoreOpt = Optional.empty();

            // Tìm đúng bảng điểm (Draft hoặc Submitted) của Giám khảo này cho Bài nộp này
            if (trackId != null) {
                Optional<JudgeAssignment> assignmentOpt = judgeAssignmentRepository.findByUser_IdAndTrackIdAndRoundId(judge.getId(), trackId, roundId);
                if (assignmentOpt.isPresent()) {
                    // Sử dụng hàm findByJudgeAssignmentIdAndSubmissionId có sẵn trong Repository của bạn
                    judgeScoreOpt = judgeScoreRepository.findByJudgeAssignmentIdAndSubmissionId(
                            assignmentOpt.get().getId(),
                            submission.getId()
                    );
                }
            }

            // Truyền cả bài nộp lẫn Optional điểm của giám khảo vào hàm map
            return mapToListResponse(submission, judgeScoreOpt);
        }).toList();
    }


    @Transactional
    public SubmissionDetailResponseid getSubmissionDetail(String email, Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        User judge = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Judge"));

        Long trackId = submission.getTeam().getTrack() != null ? submission.getTeam().getTrack().getId() : null;
        Long roundId = submission.getRound().getId();

        // Tìm kiếm thông tin chấm điểm cũ
        Optional<JudgeScore> judgeScoreOpt = Optional.empty();
        if (trackId != null) {
            Optional<JudgeAssignment> assignmentOpt = judgeAssignmentRepository.findByUser_IdAndTrackIdAndRoundId(judge.getId(), trackId, roundId);
            if (assignmentOpt.isPresent()) {
                judgeScoreOpt = judgeScoreRepository.findByJudgeAssignmentIdAndSubmissionId(assignmentOpt.get().getId(), submission.getId());
            }
        }

        // Truyền cả 2 vào hàm mapper đã cập nhật ở trên
        return mapToDetailResponse(submission, judgeScoreOpt);
    }

    @Transactional
    public List<ViewSubmissionTrackResponse> viewSubmissionTrackResponses(Long trackId) {
        if (!trackRepository.existsById(trackId)) {
            throw new RuntimeException("khong tim thay track");

        }
        return submissionRepository.findByTeamTrackIdAndLatestTrueOrderBySubmittedAtDesc(trackId).stream().map(this::responeviewTrack).toList();
    }

    private ViewSubmissionTrackResponse responeviewTrack(Submission submission) {
        Team team = submission.getTeam();
        Track track = team.getTrack();
        Round round = submission.getRound();
        return ViewSubmissionTrackResponse.builder()
                .submissionId(submission.getId())
                .teamId(team.getId())
                .teamName(team.getName())
                .trackId(track.getId())
                .roundId(round.getId())
                .roundName(round.getName())
                .submittedAt(submission.getSubmittedAt())


                .build();
    }

    private void validateSubmittionLinks(SubmissionRequest request) {
        boolean hasGithub =
                hasText(request.getGithUrl());
        boolean hasdemoUrl =
                hasText(request.getDemoUrl());
        boolean hasdocument =
                hasText(request.getDocumentUrl());


        if (!hasGithub) {
            throw new RuntimeException("bat buoc phai nop link git ");

        }
        if (!hasdemoUrl) {
            throw new RuntimeException("bat buoc phai nop video ");

        }
        if (!hasdocument) {
            throw new RuntimeException("bat buoc phai nop link slide ");

        }

    }

    private SubmissionListResponse mapToListResponse(Submission submission, Optional<JudgeScore> judgeScoreOpt) {
        Team team = submission.getTeam();

        // 1. Mặc định ban đầu là chưa chấm
        String scoringStatus = "unscored";
        Double finalScore = null;
        LocalDateTime scoredAt = null;

        // Nếu giám khảo này đã từng bấm Lưu nháp hoặc Nộp điểm bài này
        if (judgeScoreOpt != null && judgeScoreOpt.isPresent()) {
            JudgeScore score = judgeScoreOpt.get();
            finalScore = score.getTotalScore();
            scoredAt = score.getUpdatedAt() != null ? score.getUpdatedAt() : score.getSubmitAt();

            // Đồng bộ chuỗi chữ thường khớp với CSS Trạng thái hiển thị ở Frontend
            if (score.getStatus() == com.minhtung.hackathon.enums.JudgeScoreStatus.SUBMITTED) {
                scoringStatus = "done";  // Badge màu xanh/xám: Đã chấm xong
            } else {
                scoringStatus = "draft"; // Badge màu vàng: Đang chấm dở
            }
        }

        // 2. Map thông tin file đính kèm
        SubmissionListResponse.AttachmentStatus attachmentStatus = SubmissionListResponse.AttachmentStatus.builder()
                .github(submission.getGithubUrl() != null && !submission.getGithubUrl().isBlank())
                .video(submission.getDemoUrl() != null && !submission.getDemoUrl().isBlank())
                .slide(submission.getDocumentUrl() != null && !submission.getDocumentUrl().isBlank())
                .build();

        // 3. Build Response hoàn chỉnh
        return SubmissionListResponse.builder()
                .id(submission.getId())
                .teamId(team.getId())
                .teamName(team.getName())
                .roundId(submission.getRound().getId())
                .sumbittedAt(submission.getSubmittedAt())

                // Thông tin Đội thi & Trưởng nhóm
                .leaderName(team.getLeader() != null && team.getLeader().getFullName() != null
                        ? team.getLeader().getFullName() : "Chưa cập nhật")
                .leaderPosition(team.getLeader() != null && team.getLeader().getRole() != null
                        ? team.getLeader().getRole().toString() : "MEMBER")
                .memberCount(team.getMembers() != null ? team.getMembers().size() : 1)
                .categoryName(team.getTrack() != null ? team.getTrack().getName() : "Chung")

                // Trạng thái chấm cá nhân của Giám khảo này
                .scoringStatus(scoringStatus)
                .finalScore(finalScore)
                .scoredAt(scoredAt)
                .submission(attachmentStatus)
                .build();
    }

    private SubmissionDetailResponseid mapToDetailResponse(Submission submission, Optional<JudgeScore> judgeScoreOpt) {
        // 1. Chuyển đổi danh sách Entity thành viên của Team sang MemberResponse DTO
        List<SubmissionDetailResponseid.MemberResponse> memberDTOs = null;

        if (submission.getTeam() != null && submission.getTeam().getMembers() != null) {
            memberDTOs = submission.getTeam().getMembers().stream()
                    .map(member -> SubmissionDetailResponseid.MemberResponse.builder()
                            .id(member.getId())
                            .fullName(member.getMember().getFullName())
                            .roleInTeam(member.getRole() != null ? member.getRole().toString() : "Thành viên")
                            .isLeader(member.getRole() == MemberRole.LEADER)
                            .build())
                    .toList();
        }

        // 2. Khởi tạo Builder cho Object phản hồi chính
        SubmissionDetailResponseid.SubmissionDetailResponseidBuilder responseBuilder = SubmissionDetailResponseid.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .teamName(submission.getTeam().getName())
                .roundId(submission.getRound().getId())
                .roundName(submission.getRound().getName())
                .scoringTemplateId(
                        submission.getRound().getScoringTemplate() != null
                                ? submission.getRound().getScoringTemplate().getId()
                                : null
                )
                .githubUrl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documentUrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .latest(submission.isLatest())
                .members(memberDTOs);

        // 🎯 3. THỰC HIỆN BÓC TÁCH ĐIỂM CŨ (Nếu giám khảo đã từng Lưu nháp hoặc Chấm điểm bài này)
        if (judgeScoreOpt != null && judgeScoreOpt.isPresent()) {
            JudgeScore judgeScore = judgeScoreOpt.get();

            // Map mảng danh sách điểm chi tiết: Key = String(criterionId), Value = Double(score)
            java.util.Map<String, Double> scoresMap = judgeScore.getDetails().stream()
                    .collect(Collectors.toMap(
                            detail -> String.valueOf(detail.getCriterion().getId()),
                            detail -> detail.getScore()
                    ));

            // Map mảng danh sách nhận xét chi tiết: Key = String(criterionId), Value = String(comment)
            java.util.Map<String, String> notesMap = judgeScore.getDetails().stream()
                    .filter(detail -> detail.getComment() != null)
                    .collect(Collectors.toMap(
                            detail -> String.valueOf(detail.getCriterion().getId()),
                            detail -> detail.getComment()
                    ));

            // Gán các thông tin điểm số vào Builder
            responseBuilder.scoringStatus(judgeScore.getStatus().name()) // DRAFT hoặc SUBMITTED
                    .finalScore(judgeScore.getTotalScore())
                    .overallComment(judgeScore.getComment())
                    .scoredAt(judgeScore.getUpdatedAt())
                    .scores(scoresMap)
                    .notes(notesMap);
        } else {
            // Nếu chưa từng chấm, gán trạng thái mặc định để FE biết đường xử lý giao diện trống
            responseBuilder.scoringStatus("UNSCORED");
        }

        return responseBuilder.build();
    }

    private void validateSubmittionLinks(UpdateSubmissionRequest request) {
        boolean hasGithub =
                hasText(request.getGithubUrl());
        boolean hasdemoUrl =
                hasText(request.getDemoUrl());
        boolean hasdocument =
                hasText(request.getDocumentUrl());


        if (!hasGithub && !hasdocument && !hasdemoUrl) {
            throw new RuntimeException("phai cung cap it nhat 1 duong link de nop bai ");

        }
    }

    private boolean hasText(String value) {
        return value != null &&
                !value.trim().isEmpty();
    }

    public void validateTeamAndRound(Team team, Round round) {
        if (team.getTrack() == null || team.getTrack().getEvent() == null) {
            throw new RuntimeException("team  chưa thuoc su kien nao ");
        }

        long teamEventId = team.getTrack().getEvent().getId();
        long roundEnventId = round.getEvent().getId();

        if (teamEventId != roundEnventId) {
            throw new RuntimeException("nhóm không thuộc  sự vòng thi nay ");
        }
    }

    public void validateSumssion(Round round) {
        SubmissionConfig config = round.getSubmissionConfig();

        if (config == null || !config.isHasSubmission()) {
            throw new RuntimeException("Vòng thi không cho phép nộp bài");

        }

        LocalDateTime now = LocalDateTime.now();
        if (config.getOpeningTime() != null && now.isBefore(config.getOpeningTime())) {
            throw new RuntimeException("chưa den han nop bai ");
        }
        if (config.getSubmissionDeadline() != null && now.isAfter(config.getSubmissionDeadline())) {
            throw new RuntimeException("qua han nop bai roi  ");
        }
    }

    private String normalize(String value) {
        if (!hasText(value)) {
            return null;
        }

        return value.trim();
    }


    private void validateDemoFile(MultipartFile file) {


        if (file.getSize() > maxDemoSize.toBytes()) {
            throw new IllegalArgumentException(
                    "Video không được vượt quá 100MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException(
                    "File demo phải là video"
            );
        }
    }

    private void validateDocumentFile(MultipartFile file) {


        if (file.getSize() > maxDocumentSize.toBytes()) {
            throw new IllegalArgumentException(
                    "Slide không được vượt quá 20MB"
            );
        }

        List<String> allowedTypes = List.of(
                "application/pdf",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        if (!allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Slide chỉ hỗ trợ PDF, PPT hoặc PPTX"
            );
        }
    }

    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @Autowired
    private RoundTrackRepository roundTrackRepository;

    public SubmissionResponse getCurrentSubmission(String email, Long roundId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

//        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER, MemberStatus.OFFICAL)
//                .orElseThrow(() -> new IllegalArgumentException("Chỉ trưởng nhóm mới có quyền xem"));
//
//        Team team = leader.getTeam();
//        if (team == null) {
//            throw new IllegalArgumentException("Tài khoản chưa tham gia vào đội thi nào");
//        }
        Member member =memberRepository.findByMemberIdAndStatus(user.getId(),MemberStatus.OFFICAL).orElse(null);
        if (member == null) {
            throw new RuntimeException("MEMBER NOT FOUND");
        }
        Team team = member.getTeam();
        if (team == null) {
            throw new RuntimeException("TEAM NOT FOUND");
        }

        // 1. Tìm bài nộp mới nhất của đội trong vòng thi hiện tại
        Submission submission = submissionRepository
                .findFirstByTeamIdAndRoundIdAndLatestTrue(team.getId(), roundId)
                .orElse(null);

        if (submission == null) {
            return null; // Trả về null nếu chưa nộp bài bao giờ -> FE nhận biết dùng POST để tạo mới
        }

        // 2. Tìm TẤT CẢ các bảng điểm của Hội đồng Giám khảo chấm cho bài nộp này
        List<JudgeScore> judgeScores = judgeScoreRepository.findBySubmissionId(submission.getId());

        // 3. Lấy thông tin publish_stage từ RoundTrack
        // Giả định trong Entity Team của bạn có liên kết lấy được Track (ví dụ: team.getTrack())
        Long trackId = (team.getTrack() != null) ? team.getTrack().getId() : null;

        Integer publishStage = 1; // Mặc định là 1 (Đóng) nếu không tìm thấy cấu hình

        if (trackId != null) {
            publishStage = roundTrackRepository.findById(new RoundTrack.RoundTrackId(roundId, trackId))
                    .map(RoundTrack::getPublishStage)
                    .orElse(1);
        }

        // 4. Trả về Response chứa đầy đủ thông tin bài nộp, điểm số chỉ được điền nếu publishStage == 3
        return SubmissionResponse.from(submission, judgeScores, publishStage);
    }
}