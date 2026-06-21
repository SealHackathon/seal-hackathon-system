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
        Round round = roundRepository.findFirstByTimeEndAfterOrderByTimeEndAsc(LocalDateTime.now()).orElse(null);
        if (round == null) {
            throw new IllegalArgumentException("Round not found");
        }
        Event event = eventRepository.findByStatus(EventStatus.LIVE).orElse(null);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }
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
        comingRoundResponse.setSubmissionQuantity(round.getSubmissions().size());
        comingRoundResponse.setRoundOrdinalNumber(round.getOrdinal_number());
        return comingRoundResponse;
    }

    @Transactional
    public long createRound(RoundRequest request) {
        // 1. Kiểm tra Event có tồn tại không
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event với ID: " + request.getEventId()));

        // 2. Khởi tạo thực thể Round và set các giá trị từ Request
        Round round = new Round();
        round.setEvent(event);
        round.setName(request.getName());
        round.setTimeStart(request.getTimeStart());
        round.setTimeEnd(request.getTimeEnd());
        round.setHasPresetiontation(request.isHasPresetiontation());
        round.setTopTeamPass(request.getTopTeamPass());
        round.setOrdinal_number(request.getOrdinal_number());
        round.setSubmissionDeadline(request.getSubmissionDeadline());

        // Gán các trường mới bổ sung
        round.setPosition(request.getPosition());
        // Giả định entity Round của bạn lưu trường rubricId trực tiếp, nếu dùng liên kết thực thể hãy thay đổi tương ứng
        // round.setRubricId(request.getRubricId());

        // Lưu Round để sinh ID tự tăng làm khóa ngoại cho các bảng liên quan
        round = roundRepository.save(round);

        // 3. Xử lý lưu cấu hình nộp bài SubmissionConfig (nếu Front-end có truyền dữ liệu lên)
        if (request.getSubmissionConfig() != null) {
            RoundRequest.SubmissionConfigInfo configInfo = request.getSubmissionConfig();

            // Dùng Constructor có tham số bạn đã định nghĩa trong Entity SubmissionConfig
            SubmissionConfig config = new SubmissionConfig(
                    round,
                    configInfo.getTitle(),
                    configInfo.getOpeningTime(),
                    configInfo.getSubmissionDeadline(),
                    configInfo.getSubmissionInstructions(), configInfo.isHasSubmission()
            );

            // Set thêm trường hasSubmission của SubmissionConfig theo DTO mới của bạn
            config.setHasSubmission(configInfo.isHasSubmission());

            submissionConfigRepository.save(config);
        }

        // 4. Xử lý lưu mảng danh sách RoundTimeline đi kèm (Batch Insert)
        if (request.getTimelines() != null && !request.getTimelines().isEmpty()) {
            Round finalRound = round; // Biến final sử dụng cho scope của Stream Lambda

            List<RoundTimeline> timelinesToSave = request.getTimelines().stream()
                    .map(item -> new RoundTimeline(
                            item.getName(),
                            item.getDescription(),
                            item.getTimeStart(),
                            item.getTimeEnd(),
                            finalRound
                    ))
                    .toList();

            roundTimelineRepository.saveAll(timelinesToSave);
        }

        // Trả về ID của Round vừa được cấu hình trọn gói thành công
        return round.getId();
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
