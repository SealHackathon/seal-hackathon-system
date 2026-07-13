package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.round.ComingRoundResponse;
import com.minhtung.hackathon.dto.round.RoundDetailsResponse;
import com.minhtung.hackathon.dto.round.RoundRequest;
import com.minhtung.hackathon.dto.round.SubmissionConfigResponse;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.EventStatus;
import com.minhtung.hackathon.enums.JudgeScoreStatus;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundRepository roundRepository;
    private final EventRepository eventRepository;
    private final RoundTimelineRepository roundTimelineRepository;
    private final SubmissionConfigRepository submissionConfigRepository;
    private final CriterionRepository criterionRepository;
    private final ScoringTemplateRepository scoringTemplateRepository;
    private final MemberRepository memberRepository;

    // --- THÊM MỚI: cần cho việc tính teamTotalScore + teamRank ---
    private final SubmissionRepository submissionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final JudgeScoreRepository judgeScoreRepository;
    private final RoundTrackRepository roundTrackRepository;

    public ComingRoundResponse getComingRound() {
        Round round = roundRepository.findFirstByTimeEndAfterOrderByTimeEndAsc(LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Round not found"));

        Event event = eventRepository.findByStatus(EventStatus.LIVE)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        int roundQuantity = roundRepository.countByEventId(event.getId());

        ComingRoundResponse comingRoundResponse = new ComingRoundResponse();
        comingRoundResponse.setRoundQuantity(roundQuantity);
        comingRoundResponse.setRoundName(round.getName());
        comingRoundResponse.setRoundStartTime(round.getTimeStart());
        comingRoundResponse.setRoundEndTime(round.getTimeEnd());
        comingRoundResponse.setRoundSubmissionDeadline(round.getSubmissionDeadline());

        if (round.getScoringTemplate() != null) {
            comingRoundResponse.setScroringTemplateUrl(round.getScoringTemplate().getUrl());
        }

        comingRoundResponse.setSubmissionQuantity(round.getSubmissions() != null ? round.getSubmissions().size() : 0);
        comingRoundResponse.setRoundOrdinalNumber(round.getOrdinal_number());

        if (round.getRoundTimelines() != null) {
            List<ComingRoundResponse.TimelineResponse> timelineDTOs = round.getRoundTimelines().stream()
                    .map(t -> new ComingRoundResponse.TimelineResponse(
                            t.getId(),
                            t.getName(),
                            t.getDescription(),
                            t.getTimeStart(),
                            t.getTimeEnd()
                    ))
                    .toList();
            comingRoundResponse.setTimelines(timelineDTOs);
        } else {
            comingRoundResponse.setTimelines(new ArrayList<>());
        }

        return comingRoundResponse;
    }


    @Transactional
    public List<RoundDetailsResponse> createOrUpdateRounds(RoundRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event với ID: " + request.getEventId()));

        if (request.getRounds() == null) {
            request.setRounds(new ArrayList<>());
        }

        List<Long> activeRoundIds = request.getRounds().stream()
                .map(RoundRequest.RoundItem::getRoundId)
                .filter(id -> id != null && id > 0)
                .toList();

        if (!activeRoundIds.isEmpty()) {
            roundRepository.deleteByEventIdAndIdNotIn(event.getId(), activeRoundIds);
        } else {
            roundRepository.deleteByEventId(event.getId());
        }
        roundRepository.flush();

        if (request.getRounds().isEmpty()) {
            return List.of();
        }

        List<RoundDetailsResponse> responseList = new ArrayList<>();
        int totalRounds = request.getRounds().size();

        for (RoundRequest.RoundItem item : request.getRounds()) {
            Round round;

            if (item.getRoundId() != null && item.getRoundId() > 0) {
                round = roundRepository.findById(item.getRoundId()).orElse(new Round());
            } else {
                round = new Round();
            }

            ScoringTemplate scoringTemplate = scoringTemplateRepository.findById(item.getRubricId()).orElse(null);
            if (scoringTemplate != null) {
                round.setScoringTemplate(scoringTemplate);
            }
            round.setEvent(event);
            round.setName(item.getName());
            round.setTimeStart(item.getTimeStart());
            round.setTimeEnd(item.getTimeEnd());
            round.setHasPresetiontation(item.isHasPresetiontation());
            round.setTopTeamPass(item.getTopTeamPass());
            round.setOrdinal_number(item.getOrdinal_number());
            round.setSubmissionDeadline(item.getSubmissionDeadline());
            round.setPosition(item.getPosition());
            round.setMeetingLink(item.getMeetingLink());
            round.setLocationName(item.getLocationName());
            round.setDetailLocation(item.getDetailLocation());

            Round savedRound = roundRepository.save(round);

            SubmissionConfigResponse resConfig = null;
            if (item.getSubmissionConfig() != null) {
                RoundRequest.SubmissionConfigInfo configInfo = item.getSubmissionConfig();

                SubmissionConfig config = submissionConfigRepository.findByRoundId(savedRound.getId())
                        .orElseGet(() -> {
                            SubmissionConfig newConfig = new SubmissionConfig();
                            newConfig.setRound(savedRound);
                            return newConfig;
                        });

                config.setTitle(configInfo.getTitle());
                config.setOpeningTime(configInfo.getOpeningTime());
                config.setSubmissionDeadline(configInfo.getSubmissionDeadline());
                config.setSubmissionInstructions(configInfo.getSubmissionInstructions());
                config.setHasSubmission(configInfo.isHasSubmission());

                SubmissionConfig savedConfig = submissionConfigRepository.save(config);

                resConfig = new SubmissionConfigResponse(
                        savedConfig.getId(),
                        savedConfig.getTitle(),
                        savedConfig.getOpeningTime(),
                        savedConfig.getSubmissionDeadline(),
                        savedConfig.getSubmissionInstructions(),
                        savedConfig.isHasSubmission()
                );
            } else {
                submissionConfigRepository.deleteByRoundId(savedRound.getId());
                submissionConfigRepository.flush();
            }

            List<RoundDetailsResponse.TimelineResponse> resTimelines = new ArrayList<>();
            boolean isNewRound = (item.getRoundId() == null || item.getRoundId() <= 0);

            if (isNewRound) {
                if (item.getTimelines() != null && !item.getTimelines().isEmpty()) {
                    List<RoundTimeline> timelinesToSave = item.getTimelines().stream()
                            .map(tItem -> new RoundTimeline(
                                    tItem.getName(),
                                    tItem.getDescription(),
                                    tItem.getTimeStart(),
                                    tItem.getTimeEnd(),
                                    savedRound
                            ))
                            .toList();

                    List<RoundTimeline> savedTimelines = roundTimelineRepository.saveAll(timelinesToSave);

                    resTimelines = savedTimelines.stream()
                            .map(t -> new RoundDetailsResponse.TimelineResponse(
                                    t.getId(),
                                    t.getName(),
                                    t.getDescription(),
                                    t.getTimeStart(),
                                    t.getTimeEnd()
                            ))
                            .toList();
                }
            } else {
                List<RoundTimeline> existingTimelines = roundTimelineRepository.findByRound_IdIn(List.of(savedRound.getId()));

                resTimelines = existingTimelines.stream()
                        .map(t -> new RoundDetailsResponse.TimelineResponse(
                                t.getId(),
                                t.getName(),
                                t.getDescription(),
                                t.getTimeStart(),
                                t.getTimeEnd()
                        ))
                        .toList();
            }

            LocalDateTime now = LocalDateTime.now();
            String status = "UPCOMING";
            if (savedRound.getTimeStart() != null && savedRound.getTimeEnd() != null) {
                if (now.isBefore(savedRound.getTimeStart())) {
                    status = "UPCOMING";
                } else if (now.isAfter(savedRound.getTimeEnd())) {
                    status = "COMPLETED";
                } else {
                    status = "IN_PROGRESS";
                }
            }

            RoundDetailsResponse roundRes = new RoundDetailsResponse();
            roundRes.setRoundId(savedRound.getId());
            roundRes.setRoundName(savedRound.getName());
            roundRes.setLocationName(savedRound.getLocationName());
            roundRes.setDetailLocation(savedRound.getDetailLocation());
            roundRes.setRoundOrdinalNumber(savedRound.getOrdinal_number());
            roundRes.setRoundStartTime(savedRound.getTimeStart());
            roundRes.setRoundEndTime(savedRound.getTimeEnd());
            roundRes.setRoundSubmissionDeadline(savedRound.getSubmissionDeadline());
            roundRes.setRubricId(item.getRubricId());
            roundRes.setScroringTemplateUrl(null);
            roundRes.setTopTeamPass(savedRound.getTopTeamPass());
            roundRes.setSubmissionQuantity(0);
            roundRes.setRoundQuantity(totalRounds);
            roundRes.setStatus(status);
            roundRes.setSubmissionConfig(resConfig);
            roundRes.setTimelines(resTimelines);

            responseList.add(roundRes);
        }

        return responseList;
    }

    @Transactional
    public String deleteRound(long id) {
        Round round = roundRepository.findById(id).orElse(null);
        if (round == null) {
            throw new IllegalArgumentException("Round not found");
        }

        roundRepository.delete(round);
        return "xóa round thành công !";
    }


    /**
     * 1. Lấy chi tiết 1 vòng thi theo ID (Bao gồm cả cấu hình nộp bài SubmissionConfig)
     */
    @Transactional
    public RoundDetailsResponse getRoundDetailsById(long roundId, Long userId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Vòng thi với ID: " + roundId));

        int totalRounds = (round.getEvent() != null && round.getEvent().getRounds() != null)
                ? round.getEvent().getRounds().size() : 0;

        Team team = null;
        if (userId != null) {
            Member member = memberRepository.findByMemberIdAndStatus(userId, MemberStatus.OFFICAL).orElse(null);
            team = (member != null) ? member.getTeam() : null;
        }
        Double teamTotalScore = (team != null) ? computeTeamTotalScore(team) : null;

        return convertToResponse(round, totalRounds, team, teamTotalScore);
    }

    /**
     * 2. Lấy danh sách toàn bộ vòng thi thuộc một Sự kiện (Event) dựa vào eventId
     */
    @Transactional
    public List<RoundDetailsResponse> getRoundsByEventId(long eventId, long userId) {
        List<Round> rounds = roundRepository.findRoundsWithConfigByEventId(eventId);
        List<RoundDetailsResponse> responseList = new ArrayList<>();
        int totalRounds = rounds.size();

        Member member = memberRepository.findByMemberIdAndStatus(userId, MemberStatus.OFFICAL).orElse(null);
        Team team = (member != null) ? member.getTeam() : null;

        Double teamTotalScore = (team != null) ? computeTeamTotalScore(team) : null;

        for (Round round : rounds) {
            responseList.add(convertToResponse(round, totalRounds, team, teamTotalScore));
        }

        return responseList;
    }

    /**
     * Hàm Helper xử lý Map dữ liệu dùng chung (Tránh lặp code - DRY)
     */
    private RoundDetailsResponse convertToResponse(Round round, int totalRounds, Team team, Double teamTotalScore) {
        RoundDetailsResponse dto = new RoundDetailsResponse();
        dto.setRoundId(round.getId());
        dto.setRoundName(round.getName());
        dto.setRoundOrdinalNumber(round.getOrdinal_number());
        dto.setRoundStartTime(round.getTimeStart());
        dto.setRoundEndTime(round.getTimeEnd());
        dto.setRoundSubmissionDeadline(round.getSubmissionDeadline());
        dto.setRoundQuantity(totalRounds);

        List<Submission> roundSubmissions = submissionRepository.findByRound_IdAndLatestTrue(round.getId());

        Long trackIdForCount = null;
        if (team != null) {
            Submission teamSub = roundSubmissions.stream()
                    .filter(s -> s.getTeam().getId()==(team.getId()))
                    .findFirst().orElse(null);
            if (teamSub != null && teamSub.getTeam().getTrack() != null) {
                trackIdForCount = teamSub.getTeam().getTrack().getId();
            }
        }

        int totalTeamsInRound;
        if (trackIdForCount != null) {
            Long finalTrackId = trackIdForCount;
            totalTeamsInRound = (int) roundSubmissions.stream()
                    .filter(s -> s.getTeam().getTrack() != null && finalTrackId.equals(s.getTeam().getTrack().getId()))
                    .count();
        } else {
            totalTeamsInRound = roundSubmissions.size();
        }

        dto.setSubmissionQuantity(roundSubmissions.size());
        dto.setTotalTeamsInRound(totalTeamsInRound);
        dto.setTopTeamPass(round.getTopTeamPass());

        if (round.getScoringTemplate() != null) {
            dto.setScroringTemplateUrl(round.getScoringTemplate().getUrl());
        }

        if (round.getSubmissionConfig() != null) {
            SubmissionConfig config = round.getSubmissionConfig();
            SubmissionConfigResponse configDto = new SubmissionConfigResponse(
                    config.getId(),
                    config.getTitle(),
                    config.getSubmissionInstructions(),
                    config.getOpeningTime(),
                    config.getSubmissionDeadline()
            );
            dto.setSubmissionConfig(configDto);
        } else {
            dto.setSubmissionConfig(null);
        }

        if (round.getRoundTimelines() != null && !round.getRoundTimelines().isEmpty()) {
            List<RoundDetailsResponse.TimelineResponse> timelineDtos = round.getRoundTimelines().stream()
                    .map(timeline -> new RoundDetailsResponse.TimelineResponse(
                            timeline.getId(),
                            timeline.getName(),
                            timeline.getDescription(),
                            timeline.getTimeStart(),
                            timeline.getTimeEnd()
                    ))
                    .toList();
            dto.setTimelines(timelineDtos);
        } else {
            dto.setTimelines(new ArrayList<>());
        }

        LocalDateTime now = LocalDateTime.now();
        String status = "UPCOMING";
        if (round.getTimeStart() != null && round.getTimeEnd() != null) {
            if (now.isBefore(round.getTimeStart())) {
                status = "UPCOMING";
            } else if (now.isAfter(round.getTimeEnd())) {
                status = "COMPLETED";
            } else {
                status = "IN_PROGRESS";
            }
        }
        dto.setStatus(status);

        ScoringTemplate scoringTemplate = round.getScoringTemplate();
        if (scoringTemplate == null) {
            dto.setCriteria(new ArrayList<>());
        } else {
            List<Criterion> criteria = criterionRepository.findByScoringTemplateId(scoringTemplate.getId());
            if (criteria.isEmpty()) {
                dto.setCriteria(new ArrayList<>());
            } else {
                List<RoundDetailsResponse.CriteriaResponse> criteriaDTOs = new ArrayList<>();
                for (Criterion criterion : criteria) {
                    RoundDetailsResponse.CriteriaResponse criteriaDTO = new RoundDetailsResponse.CriteriaResponse();
                    criteriaDTO.setId(criterion.getId());
                    criteriaDTO.setName(criterion.getName());
                    criteriaDTO.setDescription(criterion.getDescription());
                    criteriaDTO.setWeight(criterion.getWeight());
                    criteriaDTOs.add(criteriaDTO);
                }
                dto.setCriteria(criteriaDTOs);
            }
        }

        if (team != null) {
            dto.setTeamTotalScore(teamTotalScore);
            dto.setTrackName(team.getTrack().getName());
            dto.setTeamRank(computeTeamRankInRound(round.getId(), team.getId()));
        }

        return dto;
    }

    /**
     * Tổng điểm (CỘNG DỒN, không chia trung bình) của team qua TẤT CẢ round đã public (publishStage = 3).
     * Gộp mọi điểm giám khảo (SUBMITTED) từ mọi round lại thành 1 danh sách rồi cộng tổng.
     */
    private Double computeTeamTotalScore(Team team) {
        List<Submission> submissions = submissionRepository.findByTeam_IdAndLatestTrue(team.getId());
        if (submissions.isEmpty()) return null;

        double sum = 0.0;
        boolean hasAnyScore = false;

        for (Submission submission : submissions) {
            Round round = submission.getRound();
            Long trackId = submission.getTeam().getTrack() != null
                    ? submission.getTeam().getTrack().getId() : null;
            if (trackId == null) continue;

            RoundTrack.RoundTrackId rtId = new RoundTrack.RoundTrackId(round.getId(), trackId);
            RoundTrack roundTrack = roundTrackRepository.findById(rtId).orElse(null);
            if (roundTrack == null || roundTrack.getPublishStage() != 3) continue;

            List<JudgeAssignment> assignments = judgeAssignmentRepository.findByRound_Id(round.getId()).stream()
                    .filter(a -> a.getTrack() != null && Objects.equals(a.getTrack().getId(), trackId))
                    .toList();

            List<JudgeScore> scores = judgeScoreRepository.findAllByRoundIdWithDetails(round.getId());
            Map<String, JudgeScore> scoreIndex = new HashMap<>();
            for (JudgeScore s : scores) {
                scoreIndex.put(s.getJudgeAssignment().getId() + "-" + s.getSubmission().getId(), s);
            }

            for (JudgeAssignment ja : assignments) {
                JudgeScore score = scoreIndex.get(ja.getId() + "-" + submission.getId());
                if (score != null && score.getStatus() == JudgeScoreStatus.SUBMITTED) {
                    sum += score.getTotalScore();
                    hasAnyScore = true;
                }
            }
        }

        return hasAnyScore ? Math.round(sum * 100.0) / 100.0 : null;
    }

    /**
     * Hạng của team trong 1 round cụ thể (so với các team CÙNG TRACK), dùng điểm trung bình của round đó để xếp hạng.
     * Trả về rank + tổng số đội (VD: 3/24).
     */
    private RoundDetailsResponse.TeamRankDTO computeTeamRankInRound(Long roundId, Long teamId) {
        List<Submission> allSubmissions = submissionRepository.findByRound_IdAndLatestTrue(roundId);

        Submission teamSubmission = allSubmissions.stream()
                .filter(s -> s.getTeam().getId()==(teamId))
                .findFirst()
                .orElse(null);
        if (teamSubmission == null || teamSubmission.getTeam().getTrack() == null) {
            return null;
        }
        Long trackId = teamSubmission.getTeam().getTrack().getId();

        List<Submission> trackSubmissions = allSubmissions.stream()
                .filter(s -> s.getTeam().getTrack() != null && trackId.equals(s.getTeam().getTrack().getId()))
                .toList();

        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByRound_Id(roundId).stream()
                .filter(a -> a.getTrack() != null && trackId.equals(a.getTrack().getId()))
                .toList();

        List<JudgeScore> scores = judgeScoreRepository.findAllByRoundIdWithDetails(roundId);
        Map<String, JudgeScore> scoreIndex = new HashMap<>();
        for (JudgeScore s : scores) {
            scoreIndex.put(s.getJudgeAssignment().getId() + "-" + s.getSubmission().getId(), s);
        }

        List<Map.Entry<Long, Double>> teamAverages = new ArrayList<>();
        for (Submission s : trackSubmissions) {
            List<Double> totals = new ArrayList<>();
            for (JudgeAssignment ja : assignments) {
                JudgeScore score = scoreIndex.get(ja.getId() + "-" + s.getId());
                if (score != null && score.getStatus() == JudgeScoreStatus.SUBMITTED) {
                    totals.add(score.getTotalScore());
                }
            }
            if (!totals.isEmpty()) {
                double avg = totals.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                teamAverages.add(Map.entry(s.getTeam().getId(), avg));
            }
        }

        teamAverages.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        int rank = -1;
        for (int i = 0; i < teamAverages.size(); i++) {
            if (teamAverages.get(i).getKey().equals(teamId)) {
                rank = i + 1;
                break;
            }
        }
        if (rank == -1) return null;

        RoundDetailsResponse.TeamRankDTO rankDto = new RoundDetailsResponse.TeamRankDTO();
        rankDto.setRank(rank);
        rankDto.setTotalTeams(teamAverages.size());
        return rankDto;
    }
}