package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.PrizeRequest;
import com.minhtung.hackathon.dto.response.PrizeResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.enums.PrizeType;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.PrizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final EventRepository eventRepository;

    // Lấy tất cả giải thưởng của một sự kiện cụ thể
    public List<PrizeResponse> getPrizesByEventId(long eventId) {
        // 1. Tìm danh sách giải thưởng theo eventId từ Repository
        List<Prize> prizeList = prizeRepository.findByEventId(eventId);

        // 2. Nếu danh sách trống hoặc null thì trả về mảng rỗng ngay lập tức
        if (prizeList == null || prizeList.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Map danh sách Entity sang danh sách DTO PrizeResponse để trả về
        return prizeList.stream()
                .map(p -> new PrizeResponse(
                        p.getId(),
                        p.getPrizeName(),
                        (double) p.getMoney(), // Cast hoặc gán sang prizeValue (double) của DTO
                        p.getDescription(),
                        p.getQuantity(), p.getEvent().getId(), p.getPrizeType().toString()       // Số lượng giải thưởng
                ))
                .toList();
    }

    public Prize getPrizeById(long id) {
        return prizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giải thưởng với ID: " + id));
    }

    @Transactional
    public List<PrizeResponse> createPrizes(PrizeRequest request) {
        // 1. Tìm Event chung một lần duy nhất từ eventId ở ngoài request
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));
        event.setParticipationBenefits(request.getParticipationBenefits());
        eventRepository.save(event);
        List<Prize> prizesToSave = new ArrayList<>();

        // 2. Duyệt qua từng item giải thưởng trong mảng gửi lên từ Front-end
        for (PrizeRequest.PrizeItem item : request.getPrizes()) {
            Prize prize = new Prize();

            prize.setPrizeName(item.getPrizeName());
            prize.setDescription(item.getDescription());
            prize.setMoney(item.getMoney());
            prize.setPrizeType(PrizeType.valueOf(item.getPrizeType()));

            // Lưu đúng quantity gửi từ FE
            prize.setQuantity(item.getQuantity());

            prize.setEvent(event);

            prizesToSave.add(prize);
        }

        // 3. Thực hiện lưu hàng loạt (Batch Insert) xuống DB
        List<Prize> savedPrizes = prizeRepository.saveAll(prizesToSave);

        // 4. MAP SANG DTO: Chuyển đổi danh sách thực thể sang PrizeResponse kèm số lượng
        return request.getPrizes().stream()
                .flatMap(item -> {
                    // Tìm những thực thể vừa lưu thuộc về nhóm giải thưởng này để lấy ID do DB sinh ra
                    List<Prize> matchingSaved = savedPrizes.stream()
                            .filter(p -> p.getPrizeName().equals(item.getPrizeName()))
                            .toList();

                    // Trả về danh sách DTO tương ứng với số lượng group giải ban đầu
                    return matchingSaved.stream().map(p -> new PrizeResponse(
                            p.getId(),
                            p.getPrizeName(),
                            (double) p.getMoney(),
                            p.getDescription(),
                            item.getQuantity(), p.getEvent().getId(), p.getPrizeType().toString()    // Gán đúng số lượng tổng của nhóm giải này (Ví dụ: 2)
                    ));
                })
                .toList();
    }


    @Transactional
    public void deletePrize(long id) {
        Prize prize = getPrizeById(id);
        prizeRepository.delete(prize);
    }
}