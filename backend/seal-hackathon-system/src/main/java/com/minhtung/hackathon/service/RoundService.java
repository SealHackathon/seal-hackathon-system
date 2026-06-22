package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.round.ComingRoundResponse;
import com.minhtung.hackathon.dto.round.RoundDetailsResponse;
import com.minhtung.hackathon.dto.round.RoundRequest;
import com.minhtung.hackathon.dto.round.SubmissionConfigResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.RoundTimeline;
import com.minhtung.hackathon.entity.SubmissionConfig;
import com.minhtung.hackathon.enums.EventStatus;
import com.minhtung.hackathon.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundRepository roundRepository;
    private final EventRepository eventRepository;
    private final RoundTimelineRepository roundTimelineRepository;
    private final SubmissionConfigRepository submissionConfigRepository;


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

        // --- MAP MẢNG TIMELINES SANG DTO PHẲNG TẠI ĐÂY ---
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
    public List<RoundDetailsResponse> createRounds(RoundRequest request) {
        // 1. Kiểm tra Event có tồn tại không
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event với ID: " + request.getEventId()));

        // 2. CHECK VÀ ÉP FLUSH XÓA SẠCH TRƯỚC
        boolean isExist = roundRepository.existsByEventId(event.getId());
        if (isExist) {
            roundRepository.deleteByEventId(event.getId());
            // 🔥 Cực kỳ quan trọng: Ép EntityManager đồng bộ lệnh DELETE xuống DB ngay lập tức
            roundRepository.flush();
        }

        // Nếu người dùng xóa sạch vòng thi, trả về list rỗng
        if (request.getRounds() == null || request.getRounds().isEmpty()) {
            return List.of();
        }

        List<RoundDetailsResponse> responseList = new ArrayList<>();
        int totalRounds = request.getRounds().size(); // Tổng số vòng thi để map vào từng response item

        // 3. DUYỆT MẢNG LƯU MỚI TINH
        for (RoundRequest.RoundItem item : request.getRounds()) {

            Round round = new Round();
            round.setEvent(event);
            round.setName(item.getName());
            round.setTimeStart(item.getTimeStart());
            round.setTimeEnd(item.getTimeEnd());
            round.setHasPresetiontation(item.isHasPresetiontation());
            round.setTopTeamPass(item.getTopTeamPass());
            round.setOrdinal_number(item.getOrdinal_number());
            round.setSubmissionDeadline(item.getSubmissionDeadline());
            round.setPosition(item.getPosition());

            // Lưu Round cha để sinh ID tự tăng
            Round savedRound = roundRepository.save(round);

            // Khởi tạo các phần tử Response con rỗng để bọc dữ liệu trả về
            SubmissionConfigResponse resConfig = null;
            List<RoundDetailsResponse.TimelineResponse> resTimelines = new ArrayList<>();

            // 4. Xử lý lưu cấu hình nộp bài SubmissionConfig
            if (item.getSubmissionConfig() != null) {
                RoundRequest.SubmissionConfigInfo configInfo = item.getSubmissionConfig();

                SubmissionConfig config = new SubmissionConfig(
                        savedRound,
                        configInfo.getTitle(),
                        configInfo.getOpeningTime(),
                        configInfo.getSubmissionDeadline(),
                        configInfo.getSubmissionInstructions(),
                        configInfo.isHasSubmission()
                );
                config.setHasSubmission(configInfo.isHasSubmission());
                SubmissionConfig savedConfig = submissionConfigRepository.save(config);

                // Map sang DTO con tương ứng trong Response của bạn
                resConfig = new SubmissionConfigResponse(
                        savedConfig.getId(),
                        savedConfig.getTitle(),
                        savedConfig.getOpeningTime(),
                        savedConfig.getSubmissionDeadline(),
                        savedConfig.getSubmissionInstructions(),
                        savedConfig.isHasSubmission()
                );
            }

            // 5. Xử lý lưu mảng danh sách RoundTimeline (Batch Insert)
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

                // Map danh sách vừa lưu sang List<TimelineResponse> của DTO trả về
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

            // 6. XÁC ĐỊNH TRẠNG THÁI VÒNG THI (UPCOMING, IN_PROGRESS, COMPLETED)
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

            // 7. BUILD OBJECT RESPONSE CHÍNH XÁC THEO FILE DTO BẠN CUNG CẤP
            RoundDetailsResponse roundRes = new RoundDetailsResponse();
            roundRes.setRoundId(savedRound.getId());
            roundRes.setRoundName(savedRound.getName());
            roundRes.setRoundOrdinalNumber(savedRound.getOrdinal_number());
            roundRes.setRoundStartTime(savedRound.getTimeStart());
            roundRes.setRoundEndTime(savedRound.getTimeEnd());
            roundRes.setRoundSubmissionDeadline(savedRound.getSubmissionDeadline());
            roundRes.setScroringTemplateUrl(null); // Gán link template chấm điểm nếu DB của bạn có trường này
            roundRes.setTopTeamPass(savedRound.getTopTeamPass());

            // Gán các trường thống kê số lượng ban đầu khi vừa tạo mới tinh
            roundRes.setSubmissionQuantity(0);
            roundRes.setRoundQuantity(totalRounds); // Giúp FE vẽ timeline thanh tiến trình dữ liệu chính xác
            roundRes.setStatus(status);

            // Gán 2 mảng con đã xử lý mapping
            roundRes.setSubmissionConfig(resConfig);
            roundRes.setTimelines(resTimelines);

            responseList.add(roundRes);
        }

        return responseList;
    }

    //delete Round
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
    public RoundDetailsResponse getRoundDetailsById(long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Vòng thi với ID: " + roundId));

        int totalRounds = (round.getEvent() != null && round.getEvent().getRounds() != null)
                ? round.getEvent().getRounds().size() : 0;

        return convertToResponse(round, totalRounds);
    }

    /**
     * 2. Lấy danh sách toàn bộ vòng thi thuộc một Sự kiện (Event) dựa vào eventId
     */
    @Transactional
    public List<RoundDetailsResponse> getRoundsByEventId(long eventId) {
        List<Round> rounds = roundRepository.findRoundsWithConfigByEventId(eventId);
        List<RoundDetailsResponse> responseList = new ArrayList<>();
        int totalRounds = rounds.size();

        for (Round round : rounds) {
            responseList.add(convertToResponse(round, totalRounds));
        }

        return responseList;
    }

    /**
     * Hàm Helper xử lý Map dữ liệu dùng chung (Tránh lặp code - DRY)
     */
    private RoundDetailsResponse convertToResponse(Round round, int totalRounds) {
        RoundDetailsResponse dto = new RoundDetailsResponse();
        dto.setRoundId(round.getId());
        dto.setRoundName(round.getName());
        dto.setRoundOrdinalNumber(round.getOrdinal_number());
        dto.setRoundStartTime(round.getTimeStart());
        dto.setRoundEndTime(round.getTimeEnd());
        dto.setRoundSubmissionDeadline(round.getSubmissionDeadline());
        dto.setRoundQuantity(totalRounds);

        // 1. Map URL tiêu chí chấm điểm từ mối quan hệ liên kết (nếu có)
        if (round.getScoringTemplate() != null) {
            dto.setScroringTemplateUrl(round.getScoringTemplate().getUrl());
        }

        // 2. Map thông tin cấu hình nộp bài (SubmissionConfig) từ quan hệ @OneToOne
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

        // 3. MAP THÊM: Chuyển đổi danh sách lịch trình (RoundTimeline) sang DTO
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
            dto.setTimelines(new ArrayList<>()); // Trả về mảng rỗng để Front-end an toàn khi loop hiển thị
        }

        // 4. Tính toán trạng thái động dựa trên thời gian thực tế của Server
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

        return dto;
    }
}
