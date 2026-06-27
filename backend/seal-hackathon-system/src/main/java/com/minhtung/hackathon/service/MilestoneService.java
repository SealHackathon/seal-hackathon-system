package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.MilestoneRequest;
import com.minhtung.hackathon.dto.response.MilestoneResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Milestone;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final EventRepository eventRepository;

    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    // Lấy tất cả mốc thời gian của sự kiện và trả về List<MilestoneResponse>
    public List<MilestoneResponse> getMilestonesByEventId(Long eventId) {
        // 1. Tìm danh sách Milestone từ Repository dựa vào eventId
        List<Milestone> milestoneList = milestoneRepository.findByEventId(eventId);

        // 2. Nếu danh sách trống, trả về mảng rỗng ngay lập tức để né lỗi NullPointerException
        if (milestoneList == null || milestoneList.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Sử dụng Stream để map từng thực thể sang DTO phẳng, bóc tách giờ giấc
        return milestoneList.stream()
                .map(m -> {
                    MilestoneResponse response = new MilestoneResponse();
                    response.setId(m.getId());
                    response.setMilestoneName(m.getMilestoneName());

                    // Ép kiểu từ LocalDateTime (Entity) sang LocalDate (DTO) bằng .toLocalDate()
                    if (m.getDateStart() != null) {
                        response.setDateStart(m.getDateStart());
                    }
                    if (m.getDateEnd() != null) {
                        response.setDateEnd(m.getDateEnd());
                    }

                    response.setDes(m.getDes());

                    // Trạng thái hiển thị (tùy thuộc vào business logic của bạn, tạm thời để mặc định)
                    response.setStatus("UPCOMING");

                    return response;
                })
                .toList();
    }

    public Milestone getMilestoneById(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Milestone với ID: " + id));
    }

    @Transactional
    public List<MilestoneResponse> createMilestones(MilestoneRequest request) {
        // 1. Tìm Event chung một lần duy nhất
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        // 2. DỌN SẠCH DỮ LIỆU CŨ VÀ FLUSH NGAY ĐỂ TRÁNH TRÙNG LẶP
        milestoneRepository.deleteByEventId(event.getId());
        milestoneRepository.flush();

        // Nếu mảng mốc thời gian gửi lên trống (User xóa hết), trả về list rỗng
        if (request.getMilestones() == null || request.getMilestones().isEmpty()) {
            return List.of();
        }

        List<Milestone> milestonesToSave = new ArrayList<>();

        // 3. Duyệt qua từng item Milestone trong mảng gửi từ Front-end
        for (MilestoneRequest.MilestoneItem item : request.getMilestones()) {
            Milestone milestone = new Milestone();

            milestone.setMilestoneName(item.getName());
            milestone.setDes(item.getDes()); // Lấy từ trường des (String)
            milestone.setDateStart(item.getTimeStart());
            milestone.setDateEnd(item.getTimeEnd());
            milestone.setEvent(event);

            milestonesToSave.add(milestone);
        }

        // 4. Batch Insert toàn bộ danh sách mốc thời gian xuống DB
        List<Milestone> savedMilestones = milestoneRepository.saveAll(milestonesToSave);

        // 5. MAP SANG DTO RESPONSE
        return savedMilestones.stream()
                .map(m -> {
                    MilestoneResponse response = new MilestoneResponse();
                    response.setId(m.getId());
                    response.setMilestoneName(m.getMilestoneName());
                    response.setDes(m.getDes());
                    response.setDateStart(m.getDateStart());
                    response.setDateEnd(m.getDateEnd());

                    // Tính toán trạng thái tự động dựa trên thời gian thực tế
                    java.time.LocalDateTime now = java.time.LocalDateTime.now();
                    String status = "UPCOMING";
                    if (m.getDateStart() != null && m.getDateEnd() != null) {
                        if (now.isBefore(m.getDateStart())) {
                            status = "UPCOMING";
                        } else if (now.isAfter(m.getDateEnd())) {
                            status = "COMPLETED";
                        } else {
                            status = "IN_PROGRESS";
                        }
                    }
                    response.setStatus(status);

                    return response;
                })
                .toList();
    }

    @Transactional
    public void deleteMilestone(Long id) {
        Milestone milestone = getMilestoneById(id);
        milestoneRepository.delete(milestone);
    }

    private void mapRequestToEntity(MilestoneRequest request, Milestone milestone) {
        milestone.setMilestoneName(request.getMilestones().get(0).getName());
        milestone.setDateStart(request.getMilestones().get(0).getTimeStart());
        milestone.setDateEnd(request.getMilestones().get(0).getTimeEnd());
        milestone.setDes(request.getMilestones().get(0).getDes());
    }
}