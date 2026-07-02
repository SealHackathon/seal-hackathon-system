package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.CriterionRequest;
import com.minhtung.hackathon.dto.request.ScoringTemplateRequest;
import com.minhtung.hackathon.dto.response.ScoringTemplateResponse;
import com.minhtung.hackathon.entity.Criterion;
import com.minhtung.hackathon.entity.ScoringTemplate;
import com.minhtung.hackathon.enums.ScoringTemplateStatus;
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
    public ScoringTemplateResponse createTemplate(ScoringTemplateRequest request) {
        ScoringTemplate template = new ScoringTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setCreateAt(LocalDateTime.now());
        template.setUpdateAt(LocalDateTime.now());

        // Bổ sung các trường mới theo yêu cầu
        template.setTieBreaking(request.isTieBreaker());
        template.setStandardDeviation(request.getDeviationThreshold());
        template.setStatus(ScoringTemplateStatus.valueOf(request.getStatus())); // Xác định lưu nháp hay chính thức
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

        // 1. Lưu xuống Database để lấy entity đã có ID và thông tin đầy đủ
        ScoringTemplate savedTemplate = templateRepository.save(template);

        // 2. Mapping từ Entity (savedTemplate) sang DTO (ScoringTemplateResponse)
        ScoringTemplateResponse response = new ScoringTemplateResponse();
        response.setId(savedTemplate.getId());
        response.setName(savedTemplate.getName());
        response.setDescription(savedTemplate.getDescription());
        response.setLastModified(savedTemplate.getUpdateAt()); // Giả định lastModified lấy từ updateAt
        response.setUsageCount(savedTemplate.getUsageCount());

        // Check xem status có phải là DRAFT hay không (tùy thuộc vào cách bạn thiết kế Enum ScoringTemplateStatus)
        response.setDraft(ScoringTemplateStatus.DRAFT.equals(savedTemplate.getStatus()));

        // Mapping danh sách Criteria con sang CriterionResponse
        if (savedTemplate.getCriteria() != null) {
            List<ScoringTemplateResponse.CriterionResponse> criteriaResponses = savedTemplate.getCriteria().stream()
                    .map(criterion -> {
                        ScoringTemplateResponse.CriterionResponse critDto = new ScoringTemplateResponse.CriterionResponse();
                        critDto.setName(criterion.getName());
                        critDto.setWeight(criterion.getWeight());
                        critDto.setDescription(criterion.getDescription());
                        return critDto;
                    })
                    .toList(); // Hoặc .collect(Collectors.toList()) nếu dùng Java bản cũ hơn 16

            response.setCriteria(criteriaResponses);
        }

        return response;
    }
    @Transactional
    public ScoringTemplateResponse updateTemplate(Long id, ScoringTemplateRequest request) {
        // 1. Tìm template cũ trong DB, nếu không thấy thì báo lỗi
        ScoringTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scoring template không tồn tại với id: " + id));

        // 2. Cập nhật các thông tin cơ bản
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setUpdateAt(LocalDateTime.now()); // Cập nhật thời gian sửa đổi

        template.setTieBreaking(request.isTieBreaker());
        template.setStandardDeviation(request.getDeviationThreshold());
        template.setStatus(ScoringTemplateStatus.valueOf(request.getStatus()));

        // 3. Xử lý danh sách Criteria (Xóa cũ, thêm mới)
        // Lưu ý: Tùy thuộc vào thiết kế Cascade trong Entity của bạn, bạn có thể cần clear list cũ
        if (template.getCriteria() != null) {
            template.getCriteria().clear();
        }

        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            for (ScoringTemplateRequest.CriterionRequest critRequest : request.getCriteria()) {
                Criterion criterion = new Criterion();
                criterion.setName(critRequest.getName());
                criterion.setDescription(critRequest.getDescription());
                criterion.setWeight(critRequest.getWeight());
                template.addCriterion(criterion); // Thêm criteria mới vào
            }
        }

        // 4. Lưu lại vào DB
        ScoringTemplate savedTemplate = templateRepository.save(template);

        // 5. Mapping sang DTO Response (Giống hệt hàm tạo mới)
        ScoringTemplateResponse response = new ScoringTemplateResponse();
        response.setId(savedTemplate.getId());
        response.setName(savedTemplate.getName());
        response.setDescription(savedTemplate.getDescription());
        response.setLastModified(savedTemplate.getUpdateAt());
        response.setUsageCount(savedTemplate.getUsageCount());
        response.setDraft(ScoringTemplateStatus.DRAFT.equals(savedTemplate.getStatus()));

        if (savedTemplate.getCriteria() != null) {
            List<ScoringTemplateResponse.CriterionResponse> criteriaResponses = savedTemplate.getCriteria().stream()
                    .map(criterion -> {
                        ScoringTemplateResponse.CriterionResponse critDto = new ScoringTemplateResponse.CriterionResponse();
                        critDto.setName(criterion.getName());
                        critDto.setWeight(criterion.getWeight());
                        critDto.setDescription(criterion.getDescription());
                        return critDto;
                    })
                    .toList();
            response.setCriteria(criteriaResponses);
        }

        return response;
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