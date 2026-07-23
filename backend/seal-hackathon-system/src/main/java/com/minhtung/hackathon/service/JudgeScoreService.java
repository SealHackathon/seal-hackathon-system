package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.JudgeScoreDetailRequest;
import com.minhtung.hackathon.dto.request.JudgeScoreRequest;
import com.minhtung.hackathon.dto.request.UpdateJudgeScoreRequest;
import com.minhtung.hackathon.dto.response.JudgeScoreDetailResponse;
import com.minhtung.hackathon.dto.response.JudgeScoreResponse;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.JudgeScoreStatus;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JudgeScoreService {
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final JudgeScoreRepository judgeScoreRepository;
    private final CriterionRepository criterionRepository;
    private final TeamResultRepository teamResultRepository;
    @Transactional
    public JudgeScoreResponse createScore(String email, JudgeScoreRequest request) {
        // 1. Tìm thông tin Giám khảo từ email đăng nhập
        User judge = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Judge"));

        // 2. Tìm bài nộp cần chấm từ request
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        // 3. Ràng buộc nghiệp vụ: Không cho phép chấm phiên bản cũ
        if (!submission.isLatest()) {
            throw new RuntimeException("Không thể chấm phiên bản nộp cũ");
        }

        if (submission.getTeam().getTrack() == null) {
            throw new RuntimeException("Team chưa thuộc track");
        }

        Long roundId = submission.getRound().getId();
        Long trackId = submission.getTeam().getTrack().getId();

        System.out.println("judgeId = " + judge.getId());
        System.out.println("trackId = " + trackId);
        System.out.println("roundId = " + roundId);

        // 4. Kiểm tra phân công chấm thi của Giám khảo này
        JudgeAssignment assignment = judgeAssignmentRepository.findByUser_IdAndTrackIdAndRoundId(judge.getId(), trackId, roundId)
                .orElseThrow(() -> new RuntimeException("Bạn không được phân công để chấm"));

        // 5. Kiểm tra xem đã tồn tại bản ghi điểm trước đó chưa
        Optional<JudgeScore> existingScoreOpt = judgeScoreRepository
                .findByJudgeAssignmentIdAndSubmissionId(assignment.getId(), submission.getId());

        JudgeScore judgeScore;

        if (existingScoreOpt.isPresent()) {
            judgeScore = existingScoreOpt.get();

            // Ràng buộc nghiệp vụ: Điểm đã SUBMITTED thì không được sửa nữa
            if (judgeScore.getStatus() == JudgeScoreStatus.SUBMITTED) {
                throw new RuntimeException("Điểm số đã được nộp chính thức trước đó, không thể thay đổi nữa.");
            }

            judgeScore.setUpdatedAt(LocalDateTime.now());

            // Xóa các chi tiết điểm (criteria score) cũ thông qua .clear() nếu đã tồn tại bản nháp
            if (judgeScore.getDetails() != null) {
                judgeScore.getDetails().clear();
                judgeScoreRepository.saveAndFlush(judgeScore); // Đẩy lệnh DELETE xuống DB ngay để dọn rác chi tiết cũ
            }
        } else {
            judgeScore = new JudgeScore();
            judgeScore.setJudgeAssignment(assignment);
            judgeScore.setSubmission(submission);
            judgeScore.setSubmitAt(LocalDateTime.now());
            judgeScore.setUpdatedAt(LocalDateTime.now());
        }

        // Gán trạng thái và nhận xét từ request
        JudgeScoreStatus newStatus = JudgeScoreStatus.valueOf(request.getStatus());
        judgeScore.setStatus(newStatus);
        judgeScore.setComment(request.getComment());

        // 6. Tạo danh sách chi tiết điểm tiêu chí mới từ request.getDetails()
        List<JudgeScoreDetail> newDetails = createDetails(
                judgeScore,
                submission,
                request.getDetails()
        );

        // Cập nhật danh sách chi tiết an toàn với Hibernate session
        if (judgeScore.getDetails() == null) {
            judgeScore.setDetails(newDetails);
        } else {
            judgeScore.getDetails().addAll(newDetails);
        }

        // Tính toán lại tổng điểm cho bảng JudgeScore dựa trên các tiêu chí vừa chấm
        judgeScore.setTotalScore(calculateTotalScore(judgeScore.getDetails()));

        // Lưu điểm của giám khảo hiện tại xuống DB
        JudgeScore savedJudgeScore = judgeScoreRepository.save(judgeScore);

        // =========================================================================
        // 7. LOGIC CẬP NHẬT HOẶC TẠO TEAM RESULT KHI NỘP ĐIỂM CHÍNH THỨC
        // =========================================================================
        if (newStatus == JudgeScoreStatus.SUBMITTED) {
            // Lấy tất cả điểm của hội đồng giám khảo đã nộp chính thức (SUBMITTED) cho bài nộp hiện hành này
            List<JudgeScore> officialScores = judgeScoreRepository
                    .findBySubmissionIdAndStatus(submission.getId(), JudgeScoreStatus.SUBMITTED);

            if (!officialScores.isEmpty()) {
                // 1. Tính điểm trung bình cộng (Điểm tổng của các Giám khảo)
                double averageScore = officialScores.stream()
                        .mapToDouble(JudgeScore::getTotalScore)
                        .average()
                        .orElse(0.0);

                // Làm tròn đến 2 chữ số thập phân
                averageScore = Math.round(averageScore * 100.0) / 100.0;

                // 2. Tìm hoặc khởi tạo mới bản ghi kết quả của Đội thi (TeamResult) tại vòng này
                Team team = submission.getTeam();
                Round round = submission.getRound();

                TeamResult teamResult = teamResultRepository.findByTeamIdAndRoundId(team.getId(), round.getId())
                        .orElseGet(() -> {
                            TeamResult newResult = new TeamResult();
                            newResult.setTeam(team);
                            newResult.setRound(round);
                            newResult.setCreatedAt(LocalDateTime.now());
                            return newResult;
                        });

                teamResult.setUpdatedAt(LocalDateTime.now());
                teamResult.setTotalScore(averageScore);

                // 3. GÁN LIÊN KẾT 2 CHIỀU GIỮA TeamResult VÀ JudgeScore

                // Phía Owning Side (JudgeScore): Đảm bảo JudgeScore có khóa ngoại team_result_id
                savedJudgeScore.setTeamResult(teamResult);

                // Phía Inverse Side (TeamResult): Khởi tạo danh sách nếu null và thêm bản ghi mới vào
                if (teamResult.getJudgeScores() == null) {
                    teamResult.setJudgeScores(new ArrayList<>());
                }

                // Tránh thêm trùng lặp nếu judgeScore đã có trong list (trường hợp update điểm nháp sang submitted)
                if (!teamResult.getJudgeScores().contains(savedJudgeScore)) {
                    teamResult.getJudgeScores().add(savedJudgeScore);
                }

                // 4. Lưu TeamResult xuống DB
                teamResultRepository.save(teamResult);
            }
        }

        return mapToResponse(savedJudgeScore);
    }

    @Transactional
    public JudgeScoreResponse updateScore(String email, Long judgeScoreId, UpdateJudgeScoreRequest request) {
        User judge = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("không có email xác nhận "));
        JudgeScore judgeScore = getownedJudgeScore(
                judgeScoreId, judge.getId()
        );
        judgeScore.setComment(request.getCommet());
        judgeScore.setUpdatedAt(LocalDateTime.now());
        judgeScore.getDetails().clear();
        List<JudgeScoreDetail> newDetails = createDetails(
                judgeScore, judgeScore.getSubmission(),
                request.getDetails()
        );
        judgeScore.getDetails().addAll(newDetails);

        return mapToResponse(judgeScoreRepository.save(judgeScore));
    }

    @Transactional
    public void deleteScore(String email, Long judgeScoreId) {
        User judge = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("không có email xác nhận "));
        JudgeScore judgeScore = getownedJudgeScore(judgeScoreId, judge.getId());
        judgeScoreRepository.delete(judgeScore);
    }

    @Transactional
    public List<JudgeScoreResponse> getMyScores(String email) {
        User judge = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("không có email xác nhận "));
        return judgeScoreRepository.findByJudgeAssignmentUserIdOrderBySubmitAtDesc(judge.getId()).stream().map(this::mapToResponse).toList();

    }

    private JudgeScore getownedJudgeScore(Long judgeScoreId, Long userId) {
        JudgeScore judgeScore = judgeScoreRepository.findById(judgeScoreId).orElseThrow(() -> new RuntimeException("khong tim thay diem cham cu"));
        Long ownerId = judgeScore.getJudgeAssignment().getUser().getId();
        if (!ownerId.equals(userId)) {
            throw new RuntimeException("ban khong co quyen thay doi diem cua bai nay ");
        }
        return judgeScore;
    }


    private JudgeScoreResponse mapToResponse(
            JudgeScore judgeScore
    ) {
        Submission submission =
                judgeScore.getSubmission();

        List<JudgeScoreDetailResponse> details =
                judgeScore.getDetails()
                        .stream()
                        .map(detail ->
                                JudgeScoreDetailResponse
                                        .builder()
                                        .id(detail.getId())
                                        .criterionId(
                                                detail.getCriterion()
                                                        .getId()
                                        )
                                        .criterionName(
                                                detail.getCriterion()
                                                        .getName()
                                        )
                                        .score(
                                                detail.getScore()
                                        )
                                        .maxScore(
                                                detail.getCriterion()
                                                        .getMaxRange()
                                        )
                                        .weight(
                                                detail.getCriterion()
                                                        .getWeight()
                                        )
                                        .commet(
                                                detail.getComment()
                                        )
                                        .build()
                        )
                        .toList();

        return JudgeScoreResponse.builder()
                .id(judgeScore.getId())
                .submissionId(submission.getId())
                .teamId(submission.getTeam().getId())
                .teamName(
                        submission.getTeam().getName()
                )
                .roundId(
                        submission.getRound().getId()
                )
                .roundName(
                        submission.getRound().getName()
                )
                .totalScore(
                        judgeScore.getTotalScore()
                )
                .comment(judgeScore.getComment())
                .submittedAt(
                        judgeScore.getSubmitAt()
                )
                .updateAt(
                        judgeScore.getUpdatedAt()
                )
                .details(details)
                .build();
    }


    private double calculateTotalScore(List<JudgeScoreDetail> details) {
        if (details == null || details.isEmpty()) {
            return 0.0;
        }

        // 1. Tính tổng tử số: Tổng của (Điểm tiêu chí * Trọng số tiêu chí)
        double weightedScoreSum = details.stream()
                .mapToDouble(detail -> {
                    double score = detail.getScore();
                    // Đi xuyên qua Object Criterion để lấy weight cấu hình trong DB
                    double weight = (detail.getCriterion() != null) ? detail.getCriterion().getWeight() : 0.0;
                    return score * weight;
                })
                .sum();

        // 2. Tính tổng mẫu số: Tổng tất cả trọng số của các tiêu chí con thuộc vòng thi này
        double totalWeight = details.stream()
                .mapToDouble(detail -> (detail.getCriterion() != null) ? detail.getCriterion().getWeight() : 0.0)
                .sum();

        if (totalWeight == 0.0) {
            return 0.0;
        }

        // 3. Quy đổi ra điểm số hệ thang 10 chuẩn hóa theo trọng số
        double finalScore = weightedScoreSum / totalWeight;

        // 4. Làm tròn toán học lấy đúng 2 chữ số thập phân (Ví dụ: 8.562 -> 8.56)
        return Math.round(finalScore * 100.0) / 100.0;
    }

    private List<JudgeScoreDetail> createDetails(JudgeScore judgeScore, Submission submission, List<JudgeScoreDetailRequest> requests
    ) {
        ScoringTemplate template = submission.getRound().getScoringTemplate();
        if (template == null) {
            throw new RuntimeException("Round chưa có mẫu chấm điểm ");
        }
        Set<Long> allowedCriterionIds = template.getCriteria()
                .stream()
                .map(Criterion::getId)
                .collect(Collectors.toSet());

        Set<Long> requestCriterionIds =
                requests.stream()
                        .map(
                                JudgeScoreDetailRequest
                                        ::getCriterionId
                        )
                        .collect(Collectors.toSet());

        if (requestCriterionIds.size() != requests.size()) {
            throw new RuntimeException("Danh sách có tiêu chi bị trùng");


        }
        if (!requestCriterionIds.equals(allowedCriterionIds)) {
            throw new RuntimeException("phải chấm điểm đầy đủ và đúng tiêu chí của round ");
        }
        List<JudgeScoreDetail> details = new ArrayList<>();
        for (JudgeScoreDetailRequest request : requests) {
            Criterion criterion = criterionRepository.findById(request.getCriterionId()).orElseThrow(() -> new RuntimeException("không tìm thấy tiêu chí chấm thi"));
            if (request.getScore() < 0 ||
                    request.getScore()
                            > criterion.getMaxRange()) {
                throw new RuntimeException(
                        "Điểm tiêu chí "
                                + criterion.getName()
                                + " phải nằm trong khoảng 0 - "
                                + criterion.getMaxRange()
                );
            }
            JudgeScoreDetail detail =
                    new JudgeScoreDetail();

            detail.setJudgeScore(judgeScore);
            detail.setCriterion(criterion);
            detail.setScore(request.getScore());
            detail.setComment(request.getComment()

            );

            details.add(detail);
        }

        return details;
    }


}




