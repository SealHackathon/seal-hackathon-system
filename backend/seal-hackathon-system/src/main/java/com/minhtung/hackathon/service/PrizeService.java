package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.PrizeRequest;
import com.minhtung.hackathon.dto.response.PrizeDTO;
import com.minhtung.hackathon.dto.response.PrizeMapper;
import com.minhtung.hackathon.dto.response.PrizeResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Prize;
import com.minhtung.hackathon.entity.PrizeResult;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.enums.PrizeType;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.PrizeRepository;
import com.minhtung.hackathon.repository.PrizeResultRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.minhtung.hackathon.dto.response.PrizeMapper.toDTO;

@Service
@RequiredArgsConstructor
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final EventRepository eventRepository;
    private final PrizeResultRepository prizeResultRepository;
    private final TeamRepository teamRepository;
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

        // Cập nhật thông tin quyền lợi tham gia sự kiện
        event.setParticipationBenefits(request.getParticipationBenefits());
        eventRepository.save(event);

        // GHI ĐÈ: Xóa toàn bộ các giải thưởng cũ thuộc về Event này trước khi lưu mới
        prizeRepository.deleteByEventId(event.getId());
        // Hoặc nếu bạn chưa viết method trên trong Repository, có thể dùng: prizeRepository.deleteAll(event.getPrizes());

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

        // 3. Thực hiện lưu hàng loạt (Batch Insert) xuống DB danh sách mới thay thế hoàn toàn
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
                            item.getQuantity(),
                            p.getEvent().getId(),
                            p.getPrizeType().toString()
                    ));
                })
                .toList();
    }


    @Transactional
    public void deletePrize(long id) {
        Prize prize = getPrizeById(id);
        prizeRepository.delete(prize);
    }


    public List<PrizeDTO> getExtendedPrizes(Long eventId) {
        // TODO: đổi PrizeType.EXTENDED cho đúng tên value trong enum của bạn
        List<Prize> prizes = prizeRepository.findByEvent_IdAndPrizeType(eventId, PrizeType.EXTENDED);

        // Lấy sẵn toàn bộ kết quả gán của event này để tránh query N+1
        Map<Long, PrizeResult> resultMap = prizeResultRepository.findByPrize_Event_Id(eventId)
                .stream()
                .collect(Collectors.toMap(pr -> pr.getPrize().getId(), pr -> pr));

        return prizes.stream()
                .map(p -> toDTO(p, resultMap.get(p.getId())))
                .collect(Collectors.toList());
    }


    @Transactional
    public PrizeDTO assignTeam(Long prizeId, Long teamId) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giải id=" + prizeId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đội id=" + teamId));

        // Nếu giải đã từng được gán -> update lại đội mới, chưa có -> tạo mới
        PrizeResult result = prizeResultRepository.findByPrize_Id(prizeId)
                .orElse(new PrizeResult());
        result.setPrize(prize);
        result.setTeam(team);
        PrizeResult saved = prizeResultRepository.save(result);

        return toDTO(prize, saved);
    }

    private PrizeDTO toDTO(Prize prize, PrizeResult result) {
        PrizeDTO dto = new PrizeDTO();
        dto.setId(prize.getId());
        dto.setDescription(prize.getDescription());
        dto.setMoney(prize.getMoney());
        dto.setPrizeType(prize.getPrizeType());
        dto.setPrizeName(prize.getPrizeName());
        dto.setQuantity(prize.getQuantity());
        if (result != null) {
            dto.setTeamId(result.getTeam().getId());
            dto.setTeamName(result.getTeam().getName());
        }
        return dto;
    }
}