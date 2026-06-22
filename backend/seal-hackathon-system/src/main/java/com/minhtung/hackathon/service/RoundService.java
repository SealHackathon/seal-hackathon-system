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
    public void createRounds(RoundRequest request) {
        // 1. Kiểm tra Event có tồn tại không
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event với ID: " + request.getEventId()));

        // 2. CHECK VÀ XÓA SẠCH NẾU ĐÃ TỒN TẠI
        // Kiểm tra xem Event này đã từng được cấu hình bất kỳ vòng thi (Round) nào chưa
        boolean isExist = roundRepository.existsByEventId(event.getId());
        if (isExist) {
            // Nếu đã có, xóa sạch toàn bộ các Round cũ thuộc về Event này
            // Cấu hình Cascade ở Entity sẽ tự động dọn sạch dữ liệu liên quan ở bảng SubmissionConfig và RoundTimeline
            roundRepository.deleteByEventId(event.getId());
        }

        // Nếu danh sách rounds gửi xuống trống (User xóa sạch các vòng), kết thúc xử lý tại đây
        if (request.getRounds() == null || request.getRounds().isEmpty()) {
            return;
        }

        // 3. DUYỆT MẢNG LƯU MỚI TINH (Giữ nguyên logic khởi tạo trọn gói từ code cũ của bạn)
        for (RoundRequest.RoundItem item : request.getRounds()) {

            // Khởi tạo thực thể Round mới và gán giá trị từ từng item trong List
            Round round = new Round();
            round.setEvent(event);
            round.setName(item.getName());
            round.setTimeStart(item.getTimeStart());
            round.setTimeEnd(item.getTimeEnd());
            round.setHasPresetiontation(item.isHasPresetiontation() );
            round.setTopTeamPass(item.getTopTeamPass());
            round.setOrdinal_number(item.getOrdinal_number());
            round.setSubmissionDeadline(item.getSubmissionDeadline());
            round.setPosition(item.getPosition());
            // round.setRubricId(item.getRubricId());

            // Lưu Round cha để sinh ID tự tăng làm khóa ngoại cho các bảng con
            Round savedRound = roundRepository.save(round);

            // 4. Xử lý lưu cấu hình nộp bài SubmissionConfig mới tinh đi kèm
            if (item.getSubmissionConfig() != null) {
                RoundRequest.SubmissionConfigInfo configInfo = item.getSubmissionConfig();

                // Dùng đúng Constructor có tham số cũ của bạn, truyền savedRound vừa tạo vào
                SubmissionConfig config = new SubmissionConfig(
                        savedRound,
                        configInfo.getTitle(),
                        configInfo.getOpeningTime(),
                        configInfo.getSubmissionDeadline(),
                        configInfo.getSubmissionInstructions(),
                        configInfo.isHasSubmission()
                );

                config.setHasSubmission(configInfo.isHasSubmission());
                submissionConfigRepository.save(config);
            }

            // 5. Xử lý lưu mảng danh sách RoundTimeline mới tinh đi kèm (Batch Insert)
            if (item.getTimelines() != null && !item.getTimelines().isEmpty()) {

                List<RoundTimeline> timelinesToSave = item.getTimelines().stream()
                        .map(tItem -> new RoundTimeline(
                                tItem.getName(),
                                tItem.getDescription(),
                                tItem.getTimeStart(),
                                tItem.getTimeEnd(),
                                savedRound // Gắn chính xác vào thực thể Round cha tương ứng vừa lưu
                        ))
                        .toList();

                roundTimelineRepository.saveAll(timelinesToSave);
            }
        }
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
