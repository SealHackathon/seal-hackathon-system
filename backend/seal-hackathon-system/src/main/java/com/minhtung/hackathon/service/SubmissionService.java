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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final CloudinaryStorageService cloudinaryStorageService;

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
                submissionRepository.save(submission));
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
        validateSubmittionLinks(request);
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

        return SubmissionResponse.from(submissionRepository.save(newSubmission));
    }


    @Transactional
    public List<SubmissionListResponse> getSubmissionByRound(Long roundId) {
        if (!roundRepository.existsById(roundId)) {
            throw new RuntimeException("khong tim thay vong thi");
        }
        return submissionRepository.findByRoundIdAndLatestTrueOrderBySubmittedAtDesc(roundId).stream().map(this::mapToListResponse).toList();
    }


    @Transactional
    public SubmissionDetailResponseid getSubmissionById(Long id) {
        Submission submission = submissionRepository.findById(id).orElseThrow(() -> new RuntimeException("khong tim thay bai nop "));
        return mapToDetailResponse(submission);
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

    private SubmissionListResponse mapToListResponse(
            Submission submission
    ) {
        return SubmissionListResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .teamName(submission.getTeam().getName())
                .roundId(submission.getRound().getId())
                .sumbittedAt(submission.getSubmittedAt())
                .build();
    }

    private SubmissionDetailResponseid mapToDetailResponse(
            Submission submission
    ) {
        return SubmissionDetailResponseid.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .teamName(submission.getTeam().getName())
                .roundId(submission.getRound().getId())
                .roundName(submission.getRound().getName())
                .scoringTemplateId(
                        submission.getRound().getScoringTemplate() != null
                                ? submission.getRound()
                                  .getScoringTemplate()
                                  .getId()
                                : null
                )
                .githubUrl(submission.getGithubUrl())
                .demoUrl(submission.getDemoUrl())
                .documentUrl(submission.getDocumentUrl())
                .submittedAt(submission.getSubmittedAt())
                .latest(submission.isLatest())
                .build();
    }


    private void validateSubmittionLinks(UpdateSubmissionRequest request) {
        boolean hasGithub =
                hasText(request.getGithubUrl());
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

}