package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.CriterionRequest;
import com.minhtung.hackathon.dto.request.ScoringTemplateRequest;
import com.minhtung.hackathon.entity.Criterion;
import com.minhtung.hackathon.entity.ScoringTemplate;
import com.minhtung.hackathon.repository.ScoringTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoringTemplateService {

    private final ScoringTemplateRepository templateRepository;

    public List<ScoringTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public ScoringTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mẫu chấm điểm với ID: " + id));
    }

    @Transactional
    public ScoringTemplate createTemplate(ScoringTemplateRequest request) {
        ScoringTemplate template = new ScoringTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setUrl(request.getUrl());
        template.setCreateAt(LocalDateTime.now());

        if (request.getCriteria() != null) {
            template.setCriteria(mapCriteriaRequests(request.getCriteria(), template));
        }

        return templateRepository.save(template);
    }

    @Transactional
    public ScoringTemplate updateTemplate(Long id, ScoringTemplateRequest request) {
        ScoringTemplate template = getTemplateById(id);

        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setUrl(request.getUrl());

        if (request.getCriteria() != null) {
            // Xóa danh sách cũ, Hibernate sẽ tự xóa trong DB nhờ orphanRemoval = true
            template.getCriteria().clear();
            // Map danh sách mới từ Request DTO
            List<Criterion> newCriteria = mapCriteriaRequests(request.getCriteria(), template);
            template.getCriteria().addAll(newCriteria);
        }

        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        ScoringTemplate template = getTemplateById(id);
        templateRepository.delete(template);
    }

    // Hàm chuyển đổi rõ ràng, không còn ép kiểu ép số (cast) thủ công phức tạp
    private List<Criterion> mapCriteriaRequests(List<CriterionRequest> criteriaRequests, ScoringTemplate template) {
        List<Criterion> criteriaList = new ArrayList<>();

        for (CriterionRequest cReq : criteriaRequests) {
            String name = (cReq.getName() != null && !cReq.getName().trim().isEmpty())
                    ? cReq.getName() : "Tiêu chí chưa đặt tên";

            // Gọi Constructor 5 tham số của Entity Criterion
            Criterion criterion = new Criterion(
                    name,
                    cReq.getDescription(),
                    cReq.getWeight(),
                    cReq.getMaxRange(),
                    template
            );
            criteriaList.add(criterion);
        }
        return criteriaList;
    }
}