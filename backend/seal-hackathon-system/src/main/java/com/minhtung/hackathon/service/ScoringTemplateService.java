package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.CriterionRequest;
import com.minhtung.hackathon.dto.request.ScoringTemplateRequest;
import com.minhtung.hackathon.dto.response.ScoringTemplateResponse;
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

    public List<ScoringTemplateResponse> getAllTemplates() {
        // 1. Lấy tất cả Entity từ Database lên
        List<ScoringTemplate> entities = templateRepository.findAll();

        // Tạo list rỗng để chứa kết quả DTO trả về cho Client
        List<ScoringTemplateResponse> responses = new ArrayList<>();

        // VÒNG FOR 1: Duyệt qua từng ScoringTemplate Entity
        for (ScoringTemplate entity : entities) {
            ScoringTemplateResponse templateDto = new ScoringTemplateResponse();

            // Map các trường từ Entity sang DTO
            templateDto.setId(entity.getId());
            templateDto.setName(entity.getName());
            templateDto.setDescription(entity.getDescription());
            templateDto.setLastModified(entity.getUpdateAt()); // Map updateAt -> lastModified
            templateDto.setUsageCount(entity.getUsageCount());
            String status = entity.getStatus().toString();
            boolean isDraft= (status.equals("DRAFT"))?true:false;
            templateDto.setDraft(isDraft);

            // Tạo list rỗng để chứa các Criteria DTO của Template này
            List<ScoringTemplateResponse.CriterionResponse> criteriaDtos = new ArrayList<>();

            // VÒNG FOR 2: Duyệt qua danh sách Criterion Entity con bên trong
            for (Criterion criterionEntity : entity.getCriteria()) {
                ScoringTemplateResponse.CriterionResponse criterionDto = new ScoringTemplateResponse.CriterionResponse();

                // Map các trường của con
                criterionDto.setName(criterionEntity.getName());
                criterionDto.setWeight(criterionEntity.getWeight());
                criterionDto.setDescription(criterionEntity.getDescription());

                // Add DTO con vào list con
                criteriaDtos.add(criterionDto);
            }

            // Gán list con đã map xong vào DTO cha
            templateDto.setCriteria(criteriaDtos);

            // Add DTO cha vào list kết quả tổng
            responses.add(templateDto);
        }

        return responses;
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
        template.setCreateAt(LocalDateTime.now());
        template.setUpdateAt(LocalDateTime.now());

        // Bổ sung các trường mới theo yêu cầu
        template.setTieBreaking(request.isTieBreaker());
        template.setStandardDeviation(request.getDeviationThreshold());
        template.setDraft(request.getStatus()); // Xác định lưu nháp hay chính thức
        template.setUsageCount(0); // Khởi tạo lượt dùng bằng 0

        // Xử lý danh sách Criteria con nếu có
        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            for (ScoringTemplateRequest.CriterionRequest critRequest : request.getCriteria()) {
                Criterion criterion = new Criterion();
                criterion.setName(critRequest.getName());
                criterion.setDescription(critRequest.getDescription());
                criterion.setWeight(critRequest.getWeight());
                template.addCriterion(criterion);
            }
        }

        return templateRepository.save(template);
    }

    @Transactional
    public ScoringTemplate updateTemplate(Long id, ScoringTemplateRequest request) {
        ScoringTemplate template = getTemplateById(id);

        template.setName(request.getName());
        template.setDescription(request.getDescription());


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


    private List<Criterion> mapCriteriaRequests(List<ScoringTemplateRequest.CriterionRequest> criteriaRequests, ScoringTemplate template) {
        List<Criterion> criteriaList = new ArrayList<>();

        // Ở đây cũng sửa kiểu dữ liệu trong vòng for luôn
        for (ScoringTemplateRequest.CriterionRequest cReq : criteriaRequests) {
            String name = (cReq.getName() != null && !cReq.getName().trim().isEmpty())
                    ? cReq.getName() : "Tiêu chí chưa đặt tên";

            Criterion criterion = new Criterion(
                    name,
                    cReq.getDescription(),
                    cReq.getWeight(),
                    template
            );
            criteriaList.add(criterion);
        }
        return criteriaList;
    }
}