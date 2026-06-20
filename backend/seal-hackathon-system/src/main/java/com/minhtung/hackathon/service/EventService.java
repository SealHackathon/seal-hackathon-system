package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.event.AllEventResponse;
import com.minhtung.hackathon.dto.event.EventDetailsResponse;
import com.minhtung.hackathon.dto.event.EventRequest;
import com.minhtung.hackathon.dto.event.LiveEventResponse;
import com.minhtung.hackathon.dto.response.MilestoneResponse;
import com.minhtung.hackathon.dto.response.PrizeResponse;
import com.minhtung.hackathon.dto.round.ComingRoundResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.Track;
import com.minhtung.hackathon.enums.EventStatus;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.TeamStatus;
import com.minhtung.hackathon.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {


    private final EventRepository eventRepository;
    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final RoundRepository roundRepository;

    // service view Event
    // service lay tat ca event tất cả status lun
    public List<AllEventResponse> getAllEvents() {
        List<Event> eventList = eventRepository.findAll();
        List<AllEventResponse> allEventResponseList = new ArrayList<>();
        for (Event event : eventList) {
            AllEventResponse eventResponse = new AllEventResponse();
            eventResponse.setEventId(event.getId());
            eventResponse.setEventName(event.getName());
            eventResponse.setEventTopic(event.getTopic());
            eventResponse.setMaxTeamMember(event.getMaxTeamMember());
            eventResponse.setEventLocation(event.getEventLocation());
            eventResponse.setTrackQuantity(eventResponse.getTrackQuantity() + event.getTracks().size());
            eventResponse.setRoundQuantity(eventResponse.getRoundQuantity() + event.getRounds().size());
            // dang hard code set prize
            eventResponse.setPrize(10000000);
            int teamQuantity = teamRepository.countTeamsByEventIdAndStatus(event.getId(), TeamStatus.APPROVED);
            eventResponse.setTeamQuantity(teamQuantity);

            int candidateQuantity = memberRepository.countOfficialParticipants(event.getId(), TeamStatus.APPROVED, MemberStatus.OFFICAL);
            eventResponse.setCandidateQuantity(candidateQuantity);
            eventResponse.setEventStatus(event.getStatus().toString());
            eventResponse.setDescription(event.getDescription());
            allEventResponseList.add(eventResponse);
        }

        return allEventResponseList;

    }


    // service view Live Event
    public LiveEventResponse getLiveEvent() {
        Event event = eventRepository.findByStatus(EventStatus.LIVE).orElse(null);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }
        LiveEventResponse eventResponse = new LiveEventResponse();
        eventResponse.setEventId(event.getId());
        eventResponse.setEventName(event.getName());
        eventResponse.setEventTopic(event.getTopic());
        eventResponse.setMaxTeamMember(event.getMaxTeamMember());
        eventResponse.setEventLocation(event.getEventLocation());
        eventResponse.setTrackQuantity(eventResponse.getTrackQuantity() + event.getTracks().size());
        // dang hard code set prize
        eventResponse.setPrize(10000000);

        int teamQuantity = teamRepository.countTeamsByEventIdAndStatus(event.getId(), TeamStatus.APPROVED);
        eventResponse.setTeamQuantity(teamQuantity);

        int candidateQuantity = memberRepository.countOfficialParticipants(event.getId(), TeamStatus.APPROVED, MemberStatus.OFFICAL);
        eventResponse.setCandidateQuantity(candidateQuantity);
        eventResponse.setEventStatus(event.getStatus().toString());
        eventResponse.setEventStatus(event.getStatus().toString());
        eventResponse.setDescription(event.getDescription());
        return eventResponse;
    }


    // tạo 1 event lưu nháp trong lúc cấu hình
    // trả về id của event
    @Transactional
    public long createEvent(EventRequest request) {
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setStatus(EventStatus.DRAFT);
        event.setMinTeamMember(request.getMinTeamMember());
        event.setMaxTeamMember(request.getMaxTeamMember());
        event.setTopic(request.getTopic());
        event.setBannerImg(request.getBannerImg());
        event.setThumbnail_image(request.getThumbnail_image());
        event.setRules(request.getRules());
        event.setCreateAt(LocalDateTime.now());
        event.setEventLocation(request.getEventLocation());
        event.setParticipationBenefits(request.getParticipationBenefits());
        eventRepository.save(event);
        return event.getId();
    }


    @Transactional
    public String deleteEvent(long id) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }
        eventRepository.delete(event);
        return "Xoa event Thanh Cong !";
    }


    // service xem chi tiết 1 event dựa vào ID (Bao gồm Prizes và Coming Round)
    public EventDetailsResponse getEventDetailsById(long id) {
        // 1. Tìm Event theo ID
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Event với ID: " + id));

        // 2. Khởi tạo và Map dữ liệu cơ bản sang DTO
        EventDetailsResponse response = new EventDetailsResponse();
        response.setEventId(event.getId());
        response.setEventName(event.getName());
        response.setEventTopic(event.getTopic());
        response.setDescription(event.getDescription());
        response.setEventLocation(event.getEventLocation());
        response.setBannerImg(event.getBannerImg());
        response.setThumbnailImage(event.getThumbnail_image());
        response.setRules(event.getRules());
        response.setParticipationBenefits(event.getParticipationBenefits());
        response.setMinTeamMember(event.getMinTeamMember());
        response.setMaxTeamMember(event.getMaxTeamMember());
        response.setCreateAt(event.getCreateAt());
        response.setEventStatus(event.getStatus().toString());

        // 3. Đếm số lượng tracks và rounds từ Relationship
        int totalTracks = event.getTracks() != null ? event.getTracks().size() : 0;
        int totalRounds = event.getRounds() != null ? event.getRounds().size() : 0;
        response.setTrackQuantity(totalTracks);
        response.setRoundQuantity(totalRounds);

        response.setTracks(event.getTracks());
        response.setRounds(event.getRounds());

        // 4. Lấy danh sách Prizes thực tế từ Entity Event (Giả định có liên kết)
        // Nếu dự án của bạn dùng PrizeRepository riêng, hãy inject repo vào và gọi: prizeRepository.findByEventId(id)
        if (event.getPrizes() != null) {
            List<PrizeResponse> prizeDTOs = event.getPrizes().stream()
                    .map(p -> new PrizeResponse(p.getId(), p.getPrizeName(), p.getMoney(), p.getDescription()))
                    .toList();
            response.setPrizes(prizeDTOs);
        } else {
            response.setPrizes(new ArrayList<>());
        }

        // 6 Lấy danh sách Milestones thực tế từ Entity Event
        if (event.getMilestones() != null) {
            LocalDateTime now = LocalDateTime.now(); // Lấy giờ chuẩn của SERVER

            List<MilestoneResponse> milestoneDTOs = event.getMilestones().stream()
                    .map(m -> {
                        // Logic tính toán trạng thái động
                        String status = com.minhtung.hackathon.enums.MilestoneStatus.UPCOMING.toString();

                        if (m.getDateStart() != null && m.getDateEnd() != null) {
                            if (now.isBefore(m.getDateStart())) {
                                status = com.minhtung.hackathon.enums.MilestoneStatus.UPCOMING.toString();
                            } else if (now.isAfter(m.getDateEnd())) {
                                status = com.minhtung.hackathon.enums.MilestoneStatus.COMPLETED.toString();
                            } else {
                                status = com.minhtung.hackathon.enums.MilestoneStatus.IN_PROGRESS.toString();
                            }
                        }

                        return new MilestoneResponse(
                                m.getId(),
                                m.getMilestoneName(),
                                m.getDateStart(),
                                m.getDateEnd(),
                                m.getDes(),
                                status // Gán trạng thái vừa tính được vào DTO
                        );
                    })
                    .toList();
            response.setMilestones(milestoneDTOs);
        } else {
            response.setMilestones(new ArrayList<>());
        }

        return response;
    }
}