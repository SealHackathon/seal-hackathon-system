package com.minhtung.hackathon.service;



import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhtung.hackathon.dto.response.DiditSessionResponse;
import com.minhtung.hackathon.dto.response.UserIdentityProfileResponse;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.entity.UserIdentityProfile;
import com.minhtung.hackathon.enums.UserStatus;
import com.minhtung.hackathon.repository.UserIdentityProfileRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpMethod;


@Service
@RequiredArgsConstructor
public class DiditService {
    @Value("${didit.api-key}")
    private String ditiApikey ;

    @Value("${didit.base-url}")
    private String ditibaseUrl ;
    @Value("${didit.workflow-id}")
    private String workflowId;

    private final UserIdentityProfileRepository userIdentityProfileRepository ;
    private final UserRepository userRepository ;
    private final ObjectMapper objectMapper ;
    private final RestTemplate restTemplate = new RestTemplate() ;

    public DiditSessionResponse createVerificationSession(Long userId, String email) {
        String url = ditibaseUrl + "/v3/session/";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", ditiApikey);

        Map<String, Object> body = new HashMap<>();
        body.put("workflow_id", workflowId);
        body.put("vendor_data", userId.toString());
        body.put("callback", ditibaseUrl + "/api/kyc/webhook.didit");

        Map<String, Object> contactDetails = new HashMap<>();
        contactDetails.put("email", email);
        body.put("contact_details", contactDetails);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<DiditSessionResponse> response =
                restTemplate.postForEntity(url, request, DiditSessionResponse.class);

        return response.getBody();
    }
    public UserIdentityProfileResponse getSessionDetail(String sessionId, Long userId) {
        String url = "https://verification.didit.me/v3/session/" + sessionId + "/decision/";

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", ditiApikey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        String responseBody = response.getBody();

        try {
            JsonNode root = objectMapper.readTree(responseBody);

            String status = root.path("status").asText();


            JsonNode id = root.path("id_verifications").get(0);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            UserIdentityProfile profile = userIdentityProfileRepository.findByUser(user)
                    .orElse(new UserIdentityProfile());

            String systemStatus ;
            if ("Approved".equalsIgnoreCase(status)) {
                systemStatus = UserStatus.PENDING_APPROVAL.name();
            } else {
                systemStatus = status.toUpperCase();
            }
            profile.setUser(user);
            profile.setDiditsesion(sessionId);
            profile.setDiditStatus(systemStatus);

            profile.setFullName(id.path("full_name").asText());
            profile.setCmnd(id.path("document_number").asText());
            profile.setHometown(id.path("place_of_birth").asText());
            profile.setThuongtru(id.path("formatted_address").asText());
            profile.setGender(id.path("gender").asText());
            profile.setDateOfBirth(id.path("expiration_date").asText());
            profile.setNationality(id.path("nationality").asText());
            profile.setStudentCardUrl(id.path("front_image").asText());
            JsonNode liveness = root.path("liveness_checks").get(0);
            profile.setFace_image(liveness.path("reference_image").asText());
            profile.setCmndBack_image(id.path("back_image").asText());
            userIdentityProfileRepository.save(profile);

            return new UserIdentityProfileResponse(
                    profile.getId(),
                    profile.getFullName(),
                    profile.getCmnd(),
                    profile.getDateOfBirth(),
                    profile.getGender(),
                    profile.getNationality(),
                    profile.getHometown(),
                    profile.getThuongtru(),
                    profile.getDiditsesion(),
                    profile.getDiditStatus(),
                    profile.getStudentCardUrl(),
                    profile.getFace_image(),
                    profile.getCmndBack_image()

                    //profile.getAdminNote()
            );
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse/lưu dữ liệu Didit: " + e.getMessage());
        }


    }
}
