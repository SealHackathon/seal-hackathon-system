package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.round.ComingRoundResponse;
import com.minhtung.hackathon.dto.round.RoundRequest;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.enums.EventStatus;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.RoundRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundRepository roundRepository;
    private final EventRepository eventRepository;

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

    //Tạo Round
    @Transactional
    public long createRound(RoundRequest request) {
        Event event = eventRepository.findById(request.getEventId()).orElse(null);

        if (event == null) {
            throw new IllegalArgumentException("Event not found");
        }

        Round round = new Round();
        round.setEvent(event);
        round.setName(request.getName());
        round.setTimeStart(request.getTimeStart());
        round.setTimeEnd(request.getTimeEnd());
        round.setHasSubmission(request.isHasSubmission());
        round.setHasPresetiontation(request.isHasPresetiontation());
        round.setTopTeamPass(request.getTopTeamPass());
        round.setOrdinal_number(request.getOrdinal_number());
        round.setSubmissionDeadline(request.getSubmissionDeadline());
        roundRepository.save(round);
        return round.getId();
        // Tạm thời bỏ qua scoringTemplate nếu bạn chưa có Repository cho nó,
        // hoặc bổ sung logic tương tự như Event nếu cần thiết.
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
}
