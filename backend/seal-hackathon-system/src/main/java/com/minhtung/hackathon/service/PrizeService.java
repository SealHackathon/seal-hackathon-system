package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.PrizeRequest;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.PrizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final EventRepository eventRepository;

    // lấy tất ca giải thưởng
    public List<Prize> getAllPrizes() {
        return prizeRepository.findAll();
    }

    // lấy tất cả giải thưởng của sự kiện
    public List<Prize> getPrizesByEventId(long eventId) {
        return prizeRepository.findByEventId(eventId);
    }

    public Prize getPrizeById(long id) {
        return prizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải thưởng với ID: " + id));
    }

    @Transactional
    public Prize createPrize(PrizeRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        Prize prize = new Prize(
                request.getDescription(),
                request.getMoney(),
                request.getPrizeName(),
                event
        );

        return prizeRepository.save(prize);
    }


    @Transactional
    public void deletePrize(long id) {
        Prize prize = getPrizeById(id);
        prizeRepository.delete(prize);
    }
}