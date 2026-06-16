package com.minhtung.hackathon.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minhtung.hackathon.dto.response.DiditSessionResponse;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.entity.UserIdentityProfile;
import com.minhtung.hackathon.enums.UserStatus;
import com.minhtung.hackathon.repository.UserIdentityProfileRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KycService {

    private  final UserRepository userRepository ;
    private  final UserIdentityProfileRepository profileRepository ;
    private  final DiditService diditService ;
    private   final CloudinaryStorageService cloudinaryStorageService ;
    private  final  EmailService emailService ;
    @Transactional
    public DiditSessionResponse createKycSesion(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if(user == null){
            throw new RuntimeException("Không tìm thấy user với email:"+email);
        }
        if(!user.isActive()){
            throw new RuntimeException("Tài khoản chưa xác nhận Gmail");
        }

        DiditSessionResponse diditSessionResponse = diditService.createVerificationSession(user.getId(), user.getEmail());

        UserIdentityProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserIdentityProfile());

        profile.setUser(user);
        profile.setDiditsesion(diditSessionResponse.getSessionId());
        profile.setDiditStatus("PENDING");

        profileRepository.save(profile);

       user.setStatus(UserStatus.KYC_PENDING);
       userRepository.save(user);

        return diditSessionResponse;
    }


    @Transactional
    public void handleDitiWebhook(String rawJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(rawJson);

            String sessionId = root.path("session_id").asText();
            String status = root.path("status").asText();

            UserIdentityProfile profile = profileRepository
                    .findByDiditsesion(sessionId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Didit"));

            profile.setDiditStatus(status);

            if ("Approved".equalsIgnoreCase(status)) {
                JsonNode id = root.path("decision")
                        .path("id_verifications")
                        .get(0);

                profile.setCmnd(id.path("document_number").asText(null));
                profile.setFullName(id.path("full_name").asText(null));
                profile.setHometown(id.path("place_of_birth").asText(null));
                profile.setThuongtru(id.path("address").asText(null));

                User user = profile.getUser();

                if (profile.getStudentCardUrl() != null) {
                    user.setStatus(UserStatus.PENDING_APPROVAL);
                } else {
                    user.setStatus(UserStatus.PROFILE_PENDING);
                }

                userRepository.save(user);
            }

            profileRepository.save(profile);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi xử lý webhook Didit", e);
        }
    }

    @Transactional

public String uploadStudentCart(String email , MultipartFile file , String mssv , String school){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        if(!user.isActive()){
            throw new RuntimeException("Tài khoản chưa xác nhận Gmail");
        }
        UserIdentityProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("ban can quet cccd truoc"));

        String imageUrl = cloudinaryStorageService.uploadStudentCard(file,user.getId());
        profile.setStudentCardUrl(imageUrl);
        profile.setMssv(mssv);
        profile.setSchool(school);
        profileRepository.save(profile);
        if(profile.getCmnd()!=null){
            user.setStatus(UserStatus.PENDING_APPROVAL);
            userRepository.save(user);
        }
        return  imageUrl ;
    }

    @Transactional
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        UserIdentityProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User chưa có hồ sơ"));

        if (profile.getCmnd() == null || profile.getStudentCardUrl() == null) {
            throw new RuntimeException("Hồ sơ chưa đầy đủ");
        }

        user.setStatus(UserStatus.ACCEPTED);
        userRepository.save(user);

       emailService.emailxacnhantuadmin(user.getEmail());
    }

}
