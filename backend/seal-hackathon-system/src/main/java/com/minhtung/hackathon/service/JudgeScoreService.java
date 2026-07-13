package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.JudgeScoreDetailRequest;
import com.minhtung.hackathon.dto.request.JudgeScoreRequest;
import com.minhtung.hackathon.dto.request.UpdateJudgeScoreRequest;
import com.minhtung.hackathon.dto.response.JudgeScoreDetailResponse;
import com.minhtung.hackathon.dto.response.JudgeScoreResponse;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @Transactional
    public JudgeScoreResponse createScore(String email, JudgeScoreRequest request) {
        User judge = userRepository.findByEmail(email).orElseThrow(() ->
                new RuntimeException(
                        "Không tìm thấy Judge"));
        Submission submission = submissionRepository.findById(request.getSubmissionId()).orElseThrow((() -> new RuntimeException("không tìm thấy bài nộp ")));



        Team team = submission.getTeam();
        Round round = submission.getRound();
        if (!submission.isLatest()) {
            throw new RuntimeException("không thể chấm phiên bản nộp cũ ");


        }

        if(team == null ){
            throw  new  RuntimeException("bai nop khong thuoc team nao ") ;

        }
        if(round == null){
            throw  new RuntimeException("bai nay khong thuoc vong thi nao  ") ;

        }
        if (team.getTrack() == null) {
            throw new RuntimeException("Team chưa thuộc track");
        }

        if (team.getTrack().getEvent() == null) {
            throw new RuntimeException("Track của team chưa thuộc sự kiện nào");
        }

        long teamEventId = team.getTrack().getEvent().getId();
        long roundEventId = round.getEvent().getId();

        if (teamEventId != roundEventId) {
            throw new RuntimeException(
                    "Team không thuộc vòng thi của sự kiện này"
            );
        }

        Long trackId = team.getTrack().getId();
        Long roundId  = round.getId();
        JudgeAssignment assignment = judgeAssignmentRepository.findByUser_IdAndTrackIdAndRoundId(judge.getId(), trackId,roundId).orElseThrow(() -> new RuntimeException("bạn không được phân công trong track này "));

        boolean alreadyScored = judgeScoreRepository.existsByJudgeAssignmentIdAndSubmissionId(assignment.getId(), submission.getId());

        if (alreadyScored) {
            throw new RuntimeException("bạn đã chấm bài này rồi ");
        }
        JudgeScore judgeScore = new JudgeScore();
        judgeScore.setJudgeAssignment(assignment);
        judgeScore.setSubmission(submission);
        judgeScore.setComment(request.getComment());
        judgeScore.setSubmitAt(LocalDateTime.now());
        judgeScore.setUpdatedAt(LocalDateTime.now());
        List<JudgeScoreDetail> details =
                createDetails(
                        judgeScore,
                        submission,
                        request.getDetails()
                );
        judgeScore.setDetails(details);
        judgeScore.setTotalScore(calculateTotalScore(details));
        return mapToResponse(judgeScoreRepository.save(judgeScore));
    }


    @Transactional
    public JudgeScoreResponse updateScore(String email , Long judgeScoreId, UpdateJudgeScoreRequest request){
        User judge = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("không có email xác nhận "));
         JudgeScore judgeScore = getownedJudgeScore(
                 judgeScoreId,judge.getId()
         );
         judgeScore.setComment(request.getCommet());
         judgeScore.setUpdatedAt(LocalDateTime.now());

        List<JudgeScoreDetail> validatedDetails = createDetails(
                judgeScore,
                judgeScore.getSubmission(),
                request.getDetails()
        );
        for (JudgeScoreDetail newDetail : validatedDetails) {
            JudgeScoreDetail existingDetail = judgeScore.getDetails()
                    .stream()
                    .filter(detail ->
                            detail.getCriterion().getId()
                                    == newDetail.getCriterion().getId())
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException("Không tìm thấy điểm tiêu chí cũ"));

            existingDetail.setScore(newDetail.getScore());
            existingDetail.setComment(newDetail.getComment());
        }
        judgeScore.setTotalScore(calculateTotalScore((judgeScore.getDetails())));

         return  mapToResponse(judgeScoreRepository.save(judgeScore));
    }

    @Transactional
    public void deleteScore(String email , Long judgeScoreId){
        User judge = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("không có email xác nhận "));
        JudgeScore judgeScore = getownedJudgeScore(judgeScoreId,judge.getId()) ;
        judgeScoreRepository.delete(judgeScore);
    }

    @Transactional
    public List<JudgeScoreResponse> getMyScores(String email ){
        User judge = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("không có email xác nhận "));


        List<JudgeScoreResponse>scores = judgeScoreRepository.findByJudgeAssignmentUserIdOrderBySubmitAtDesc(judge.getId()).stream().map(this::mapToResponse ).toList() ;
        if(scores.isEmpty()){
            throw new RuntimeException("bạn chưa chấm bài này") ;
        }
        return scores ;

    }

    private JudgeScore getownedJudgeScore(Long judgeScoreId , Long userId){
        JudgeScore judgeScore = judgeScoreRepository.findById(judgeScoreId).orElseThrow(()-> new RuntimeException("khong tim thay diem cham cu"));
        Long ownerId = judgeScore.getJudgeAssignment().getUser().getId() ;
        if(!ownerId.equals(userId)){
            throw  new RuntimeException("ban khong co quyen thay doi diem cua bai nay ") ;
        }
        return judgeScore ;
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




    private double calculateTotalScore(
            List<JudgeScoreDetail> details
    ) {
        double total = details.stream()
                .mapToDouble(detail -> {
                    Criterion criterion =
                            detail.getCriterion();

                    return (
                            detail.getScore()
                                    / criterion.getMaxRange()
                    ) * criterion.getWeight();
                })
                .sum();

        return Math.round(total * 100.0) / 100.0;
    }

    private List<JudgeScoreDetail>createDetails(JudgeScore judgeScore , Submission submission , List<JudgeScoreDetailRequest> requests
    ){
        ScoringTemplate template = submission.getRound().getScoringTemplate();
        if(template == null){
            throw  new RuntimeException("Round chưa có mẫu chấm điểm ") ;
        }
        Set <Long> allowedCriterionIds = template.getCriteria()
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

        if(requestCriterionIds.size()!= requests.size()){
            throw new RuntimeException("Danh sách có tiêu chi bị trùng") ;


        }
        if(!requestCriterionIds.equals(allowedCriterionIds)){
            throw  new RuntimeException("phải chấm điểm đầy đủ và đúng tiêu chí của round ");
        }
        List<JudgeScoreDetail>details = new ArrayList<>();
        for(JudgeScoreDetailRequest request : requests){
            Criterion criterion = criterionRepository.findById(request.getCriterionId()).orElseThrow(()-> new RuntimeException("không tìm thấy tiêu chí chấm thi")) ;
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




