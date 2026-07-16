package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.SubmissionRequest;
import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.JudgeScoreStatus;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final TrackRepository trackRepository ;
    private  final CloudinaryStorageService cloudinaryStorageService ;
    private final TeamResultRepository teamResultRepository;
    private final JudgeScoreRepository judgeScoreRepository;
    private final RoundTrackRepository roundTrackRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    @Value("${submission.demo.max-size}")
    private DataSize maxDemoSize;

    @Value("${submission.document.max-size}")
    private DataSize maxDocumentSize;
    @Transactional
    public SubmissionResponse sumbit(String email , SubmissionRequest request , MultipartFile demoFile, MultipartFile documentFile){
        //kiem tra co tai khoan chua
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException(" ban chua dang ki tk"));
        //check xem chi leader moi duoc nop bai
        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER , MemberStatus.OFFICAL).orElseThrow(() ->
                new IllegalArgumentException(
                        "Chỉ trưởng nhóm được phép nộp bài"
                ));
        // tim kiem co round nay khong
        Team team = leader.getTeam() ;
        Round round = roundRepository.findById(request.getRoundId()).orElseThrow(()-> new RuntimeException("khong tìm thấy vòng thi này"));

        //check xem team co thuoc round nay khong
        validateTeamAndRound(team , round);
        //nay la check xem den thoi gian nop hay het han nop
        validateSumssion(round);
        String githubUrl = normalize(request.getGithUrl());
        String demoUrl = normalize(request.getDemoUrl());
        String documentUrl = normalize(request.getDocumentUrl());


        //link github la bat buoc
        if(!hasText(githubUrl)){
            throw new RuntimeException("Link gihthub la bat buoc");
        }
        boolean hasDemoFile =
                demoFile != null && !demoFile.isEmpty();

        boolean hasDocumentFile =
                documentFile != null && !documentFile.isEmpty();

        Validdate(demoUrl , hasDemoFile , "Video demo") ;
        Validdate(
                documentUrl,
                hasDocumentFile,
                "Tài liệu/slide") ;
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
                submissionRepository.save(submission));
    }

    @Transactional
    public SubmissionResponse updateSubmission(String email, Long submissionId, SubmissionRequest request, MultipartFile demoFile, MultipartFile documentFile) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException(" ban chua dang ki tk"));

        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER, MemberStatus.OFFICAL).orElseThrow(() ->
                new IllegalArgumentException("Chi truong nhom duoc phep nop bai")
        );

        Submission oldSubmission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("khong tim thay bai nop"));

        if (!oldSubmission.isLatest()) {
            throw new RuntimeException("Chi duoc cap nhat bai nop moi nhat");
        }

        Team team = oldSubmission.getTeam();
        Round round = oldSubmission.getRound();

        if (team.getId() != leader.getTeam().getId()) {
            throw new RuntimeException("ban khong phai truong nhom cua bai nop nay");
        }

        validateTeamAndRound(team, round);
        validateSumssion(round);

        String githubUrl = normalize(request.getGithUrl());
        String demoUrl = normalize(request.getDemoUrl());
        String documentUrl = normalize(request.getDocumentUrl());

        if (!hasText(githubUrl)) {
            throw new RuntimeException("Link gihthub la bat buoc");
        }

        boolean hasDemoFile = demoFile != null && !demoFile.isEmpty();
        boolean hasDocumentFile = documentFile != null && !documentFile.isEmpty();

        // =================================================================
        // LOGIC MỚI: XỬ LÝ LẠI ĐỂ GIỮ FILE CŨ NẾU NGƯỜI DÙNG KHÔNG CẬP NHẬT
        // =================================================================

        // 1. Xử lý Video Demo
        if (hasDemoFile) {
            // Nếu có upload file mới -> Validate và upload lên Cloudinary
            validateDemoFile(demoFile);
            demoUrl = cloudinaryStorageService.uploadSubmissionFile(demoFile, team.getId(), round.getId(), "video");
        } else if (!hasText(demoUrl)) {
            // Nếu KHÔNG upload file mới VÀ KHÔNG nhập link mới -> Giữ lại link cũ từ bài nộp trước
            demoUrl = oldSubmission.getDemoUrl();
        } else {
            // Trường hợp còn lại: Người dùng chủ động chuyển sang điền Link URL mới
            Validdate(demoUrl, hasDemoFile, "Video demo");
        }

        // 2. Xử lý Tài liệu / Slide
        if (hasDocumentFile) {
            // Nếu có upload file mới
            validateDocumentFile(documentFile);
            documentUrl = cloudinaryStorageService.uploadSubmissionFile(documentFile, team.getId(), round.getId(), "raw");
        } else if (!hasText(documentUrl)) {
            // Nếu KHÔNG upload file mới VÀ KHÔNG nhập link mới -> Giữ lại tài liệu cũ
            documentUrl = oldSubmission.getDocumentUrl();
        } else {
            // Trường hợp người dùng chủ động điền Link URL mới
            Validdate(documentUrl, hasDocumentFile, "Tài liệu/slide");
        }
        // =================================================================

        // Đánh dấu bài nộp cũ không còn là latest nữa
        oldSubmission.setLatest(false);
        submissionRepository.save(oldSubmission);

        // Tạo bản ghi bài nộp mới (lưu lịch sử)
        Submission newSubmission = new Submission();
        newSubmission.setTeam(team);
        newSubmission.setRound(round);
        newSubmission.setGithubUrl(githubUrl);
        newSubmission.setDemoUrl(demoUrl);
        newSubmission.setDocumentUrl(documentUrl);
        newSubmission.setSubmittedAt(LocalDateTime.now());
        newSubmission.setLatest(true);

        return SubmissionResponse.from(submissionRepository.save(newSubmission));
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
    public SubmissionDetailResponseid getSubmissionById(String email, Long submissionId) {
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
    public List<ViewSubmissionTrackResponse>    viewSubmissionTrackResponses(Long trackId){
        if(!trackRepository.existsById(trackId)){
            throw  new RuntimeException("khong tim thay track");

        }
        return  submissionRepository.findByTeamTrackIdAndLatestTrueOrderBySubmittedAtDesc(trackId).stream().map(this::responeviewTrack).toList();
    }

    private ViewSubmissionTrackResponse responeviewTrack(Submission submission){
        Team team = submission.getTeam() ;
        Track track = team.getTrack() ;
        Round round = submission.getRound() ;
        return ViewSubmissionTrackResponse.builder()
                .submissionId(submission.getId())
                .teamId(team.getId())
                .teamName(team.getName())
                .trackId(track.getId())
                .roundId(round.getId())
                .roundName(round.getName())
                .submittedAt(submission.getSubmittedAt())



                .build() ;
    }

    private void validateSubmittionLinks(SubmissionRequest request) {
        boolean hasGithub =
                hasText(request.getGithUrl());
        boolean hasdemoUrl =
                hasText(request.getDemoUrl());
        boolean hasdocument =
                hasText(request.getDocumentUrl());


        if (!hasGithub && !hasdocument && !hasdemoUrl) {
            throw new RuntimeException("phai cung cap it nhat 1 duong link de nop bai ");

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

        //  THỰC HIỆN BÓC TÁCH ĐIỂM CŨ (Nếu giám khảo đã từng Lưu nháp hoặc Chấm điểm bài này)
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
                    "Video không được vượt quá 50MB"
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
                    "Slide không được vượt quá 10MB"
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
    private void Validdate(String url , boolean hasFile , String fielName){
        boolean hasUrl = hasText(url) ;
        if(!hasUrl && !hasFile){
            throw new RuntimeException("phải cung cấp file hoặc link ") ;
        }

        if(hasUrl&& hasFile){
            throw new RuntimeException("chỉ được cung cấp file hoặc link , không được nộp cả 2 ") ;
        }
    }




    //api trả về thông tin submission và team result
    @Transactional(readOnly = true)
    public SubmissionAndTeamResultResponse getCurrentSubmission(String email, Long roundId) {
        // 1. Tìm thông tin học sinh qua email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // 2. Xác định Team của học sinh này (Leader)
        Member leader = memberRepository.findByMemberIdAndRoleAndStatus(user.getId(), MemberRole.LEADER, MemberStatus.OFFICAL)
                .orElseThrow(() -> new IllegalArgumentException("Chỉ trưởng nhóm được phép truy vấn thông tin bài nộp"));

        Team team = leader.getTeam();

        // 3. Tìm bài nộp mới nhất (latest = true) của đội tại vòng thi này
        Submission submission = submissionRepository
                .findFirstByTeamIdAndRoundIdAndLatestTrue(team.getId(), roundId)
                .orElse(null); // Nếu chưa nộp thì trả về null để Controller phản hồi 204 No Content

        if (submission == null) {
            return null;
        }

        // =================================================================
        // LOGIC MỚI: CHECK XEM ĐÃ ĐẾN STAGE 3 ĐỂ CÔNG BỐ KẾT QUẢ CHƯA
        // =================================================================
        boolean isPublished = false;
        if (team.getTrack() != null) {
            RoundTrack.RoundTrackId roundTrackId = new RoundTrack.RoundTrackId(roundId, team.getTrack().getId());
            isPublished = roundTrackRepository.findById(roundTrackId)
                    .map(rt -> rt.getPublishStage() == 3) // Chỉ bằng 3 mới coi là ĐÃ CÔNG BỐ
                    .orElse(false);
        }

        // 4. Tìm điểm trung bình chung cuộc từ TeamResult
        Double averageScore = null;
        if (isPublished) { // Chỉ lấy điểm khi đã công bố (stage == 3)
            averageScore = teamResultRepository.findByTeamIdAndRoundId(team.getId(), roundId)
                    .map(TeamResult::getTotalScore)
                    .orElse(null);
        }

        // 5. Lấy danh sách điểm số chính thức và nhận xét từ hội đồng giám khảo
        int judgesCount = 0;
        List<String> comments = new ArrayList<>();

        if (isPublished) { // Chỉ lấy số lượng giám khảo và nhận xét khi đã công bố (stage == 3)
            List<JudgeScore> officialScores = judgeScoreRepository
                    .findBySubmissionIdAndStatus(submission.getId(), JudgeScoreStatus.SUBMITTED);

            judgesCount = officialScores.size();

            comments = officialScores.stream()
                    .map(JudgeScore::getComment)
                    .filter(comment -> comment != null && !comment.trim().isEmpty())
                    .toList();
        }
        // =================================================================

        // 6. Map toàn bộ thông tin về DTO gửi về cho Frontend
        return SubmissionAndTeamResultResponse.builder()
                .id(submission.getId())
                .githubUrl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documentUrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .lastEditedAt(submission.getSubmittedAt())
                .isLate(false)
                .score(averageScore)     // Trả về số điểm thật hoặc null tùy thuộc vào isPublished
                .judgesCount(judgesCount) // Trả về số lượng giám khảo thật hoặc 0 tùy thuộc vào isPublished
                .comments(comments)       // Trả về list nhận xét thật hoặc list rỗng tùy thuộc vào isPublished
                .build();
    }

}
