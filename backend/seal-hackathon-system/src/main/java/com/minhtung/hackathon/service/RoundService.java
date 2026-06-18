package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.round.ComingRoundResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Round;
import com.minhtung.hackathon.enums.EventStatus;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.RoundRepository;
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
}
