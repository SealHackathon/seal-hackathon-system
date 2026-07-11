package com.minhtung.hackathon.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.minhtung.hackathon.dto.request.UpdateStudentProfileRequest;
import com.minhtung.hackathon.dto.response.AdminParticipantReviewResponse;
import com.minhtung.hackathon.dto.response.FaceMatchResponse;
import com.minhtung.hackathon.dto.response.StudentProfileResponse;
import com.minhtung.hackathon.dto.response.UserIdentityProfileResponse;
import com.minhtung.hackathon.entity.Student_profile;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.entity.UserIdentityProfile;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.enums.UserStatus;
import com.minhtung.hackathon.repository.StudentprofileRepository;
import com.minhtung.hackathon.repository.UserIdentityProfileRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
public class KycService {

    private final UserRepository userRepository;
    private final UserIdentityProfileRepository profileRepository;

    private final CloudinaryStorageService cloudinaryStorageService;
    private final EmailService emailService;
    private final StudentprofileRepository studentprofileRepository;
    private final Cloudinary cloudinary;
    private final IdAnalyzerService idAnalyzerService;


    @Value("${kyc.face-match-threshold}")
    private double faceMatchThreshold;
    @Value("${kyc.face-match-max-attempts}")
    private int faceMatchMaxAttempts;

    @Transactional

    public String uploadStudentCart(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        if (!user.isActive()) {
            throw new RuntimeException("Tài khoản chưa xác nhận Gmail");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("Ảnh hồ sơ tối đa 2MB");
        }
        Student_profile studentProfile =
                studentprofileRepository.findByUserId(user.getId())
                        .orElse(new Student_profile());

        studentProfile.setUser(user);
        String imageUrl = cloudinaryStorageService.uploadStudentCard(file, user.getId());
        studentProfile.setImg_studentcard(imageUrl);
        studentprofileRepository.save(studentProfile);

        return imageUrl;
    }

    @Transactional
    public void approveUser(Long userId, boolean approve) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        UserIdentityProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User chưa quét cccd "));

        Student_profile studentProfile = studentprofileRepository
                .findByUserId(userId)
                .orElse(new Student_profile());
        if (profile.getCmnd() == null || studentProfile.getImg_studentcard() == null) {
            throw new RuntimeException("Hồ sơ chưa đầy đủ");
        }
        if (approve) {
            user.setStatus(UserStatus.ACCEPTED);
            emailService.emailxacnhantuadmin(user.getEmail());
        } else {
            user.setStatus(UserStatus.REJECTED);

        }


        userRepository.save(user);


    }

    @Transactional
    public UserIdentityProfileResponse scanCccd(String email, MultipartFile front_img, MultipartFile Back_img) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Khong tim thay user"));

        if (!user.isActive()) {
            throw new RuntimeException("Tai khoan chua xac nhan gmail");

        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new RuntimeException("tai khoan khong duoc cap nhat ho sơ");
        }
        //cho nay hiện tại là đang chứa tất cả thogno tin mặt trước cccd do fpt.AI trả về
        JsonNode scanResult =
                idAnalyzerService.scanCccd(front_img, Back_img);
        System.out.println("===== ID ANALYZER RESPONSE =====");
        System.out.println(scanResult.toPrettyString());

        if (!scanResult.path("success").asBoolean(false)) {
            throw new RuntimeException("ID Analyzer khong nhan dien duoc CCCD");
        }

        // TODO CHECK CCCD ID đã trùng chưa


        String documentNumber = getIdAnalyzerValue(scanResult, "documentNumber");
//        String fullName = getIdAnalyzerValue(scanResult, "fullName");
        String lastname = getIdAnalyzerValue(scanResult, "lastName");
        String firstname = getIdAnalyzerValue(scanResult, "firstName");
        String fullName = lastname + " " + firstname;
        String dateOfBirth = formatVietnameseDate(getIdAnalyzerValue(scanResult, "dob"));
        String gender = getIdAnalyzerValue(scanResult, "sex");
        String address = getIdAnalyzerValue(scanResult, "address1");
        String hometown = getIdAnalyzerValue(scanResult, "placeOfBirth");

        validateIdAnalyzerCccd(documentNumber, fullName, dateOfBirth);
        UserIdentityProfile profile = profileRepository.findByUserId(user.getId()).orElse(new UserIdentityProfile());


        CloudinaryStorageService.CloudinaryUploadResult frontUpload =
                cloudinaryStorageService.uploadKycImageWithPublicId(
                        front_img,
                        user.getId(),
                        "cccd-front"
                );
        String backUrl = cloudinaryStorageService.uploadKycImage(Back_img, user.getId(), "cccd-Back");
        String faceUrl = cloudinaryStorageService.buildFaceCropUrl(
                frontUpload.publicId()
        );

        profile.setFrontcmnd_img(frontUpload.secureUrl());
        profile.setCmndBack_image(backUrl);
        profile.setCmnd(documentNumber);
        profile.setFullName(fullName);
        user.setFullName(fullName);

        profile.setDateOfBirth(dateOfBirth);
        profile.setGender(gender);
        profile.setThuongtru(address);
        profile.setUser(user);
        profile.setHometown(hometown);
        profile.setFace_image(faceUrl);
        // profile.setQrRaw(frontData.path("qr").asText(null));
        profileRepository.save(profile);
        userRepository.save(user);

        return mapToUserIdentityProfileResponse(profile, user);
    }

    private String getIdAnalyzerValue(JsonNode result, String fieldName) {
        JsonNode values = result.path("data").path(fieldName);
        if (!values.isArray() || values.isEmpty()) {
            return null;
        }

        String value = values.get(0).path("value").asText(null);
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateIdAnalyzerCccd(String documentNumber, String fullName, String dateOfBirth) {
        if (documentNumber == null) {
            throw new RuntimeException("Khong doc duoc ma so CCCD");
        }
        if (fullName == null) {
            throw new RuntimeException("Khong doc duoc ho ten tren CCCD");
        }
        if (dateOfBirth == null) {
            throw new RuntimeException("Khong doc duoc ngay sinh tren CCCD");
        }
    }

    private String formatVietnameseDate(String isoDate) {
        if (isoDate == null || isoDate.isBlank()) {
            return null;
        }

        try {
            LocalDate date = LocalDate.parse(isoDate, DateTimeFormatter.ISO_LOCAL_DATE);
            return date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        } catch (DateTimeParseException e) {
            return isoDate;
        }
    }

    private JsonNode getFirstData(JsonNode result) {
        JsonNode data = result.path("data");

        if (!data.isArray() || data.isEmpty()) {
            throw new RuntimeException("FPT.AI không không nhận diện được  cccd ");

        }
        return data.get(0);
    }

    private void validataCccd(JsonNode frontData, JsonNode backData) {
        String id = frontData.path("id").asText(null);
        String name = frontData.path("name").asText(null);

        String birthday = frontData.path("dob").asText(null);

        if (id == null || id.isBlank()) {
            throw new RuntimeException("khong doc duoc ma so cccd");

        }
        if (name == null || name.isBlank()) {
            throw new RuntimeException("khong dien duoc ten tren cccd");
        }
        if (birthday == null || birthday.isBlank()) {
            throw new RuntimeException("không điền được ngày thàng năm sinh trên cccd");
        }
    }

    private UserIdentityProfileResponse mapToUserIdentityProfileResponse(
            UserIdentityProfile profile,
            User user
    ) {
        return UserIdentityProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .cmnd(profile.getCmnd())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .hometown(profile.getHometown())
                .thuongtru(profile.getThuongtru())
                .frontcmnd_img(profile.getFrontcmnd_img())
                .CmndBack_img(profile.getCmndBack_image())
                .face_img(profile.getFace_image())
                .status(profile.getUser().getStatus())

                .build();


    }

    @Transactional
    public FaceMatchResponse verifySelfie(String email, MultipartFile selfieImg) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("khong tim thay user"));

        if (!user.isActive()) {
            throw new RuntimeException("chua xac nhan gmail");

        }

        UserIdentityProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("chua quet cccd "));

        if (profile.getFace_image() == null || profile.getFace_image().isBlank()) {
            throw new RuntimeException("chua co anh chan dung tu cccd");
        }
        String selffieUrl = cloudinaryStorageService.uploadKycImage(selfieImg, user.getId(), "selfie");

        JsonNode faceResult =
                idAnalyzerService.matchFaceByUrl(
                        profile.getFace_image(),
                        selfieImg
                );
        System.out.println("Face match result " + faceResult.toPrettyString());

        if (!faceResult.path("success").asBoolean(false)) {
            throw new RuntimeException(
                    "ID Analyzer khong the so khop khuon mat"
            );
        }

        JsonNode scoreNode =
                faceResult.path("scores").path("faceCompare");

        if (scoreNode.isMissingNode() || scoreNode.isNull()) {
            throw new RuntimeException(
                    "ID Analyzer khong tra ve diem faceCompare"
            );
        }

        double score = scoreNode.asDouble();

        // ID Analyzer co the tra diem theo thang 0-1 hoac 0-100.
        if (score <= 1) {
            score *= 100;
        }

        boolean matched = score >= faceMatchThreshold;

        int attempts = profile.getFaceMatchAttempts() == null
                ? 0
                : profile.getFaceMatchAttempts();

        if (matched) {
            attempts = 0;
            profile.setNeedsManualFaceReview(false);
            profile.setAdminnote(null);
        } else {
            attempts++;
        }
        boolean needsManualReview = !matched && attempts >= faceMatchMaxAttempts;
        boolean canContinue = matched || needsManualReview;

        profile.setSelfieImage(selffieUrl);
        profile.setFaceMatched(matched);
        profile.setFaceMatchAttempts(attempts);
        profile.setNeedsManualFaceReview(needsManualReview);


        if (needsManualReview) {
            profile.setAdminnote("Face match failed after " + attempts + " attempts");
        }

        profileRepository.save(profile);

        String message = matched
                ? "Face matched"
                : needsManualReview
                  ? "Face not matched, manual review required"
                  : "Face not matched";

        return new FaceMatchResponse(
                matched,
                score,
                attempts,
                canContinue,
                needsManualReview,
                message
        );
    }

    public StudentProfileResponse updatesStudentProfile(String email, UpdateStudentProfileRequest req, MultipartFile avatarFile) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new RuntimeException("khong tim thay user"));
        Student_profile profile = studentprofileRepository.findByUserId(user.getId()).orElse(new Student_profile());
        profile.setUser(user);

        // --- 1. Xử lý logic Upload Avatar lên Cloudinary ---
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                // Gọi đến service Cloudinary của bạn để upload file và lấy URL về
                // Ví dụ: String avatarUrl = cloudinaryService.uploadFile(avatarFile);
                String avatarUrl = uploadToCloudinary(avatarFile);
                profile.setAvatar(avatarUrl); // Lưu URL vào trường avatar của Entity
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi upload ảnh lên Cloudinary: " + e.getMessage());
            }
        }

        // --- 2. Các logic Validate dữ liệu ---
        if (req.getBio() != null && req.getBio().length() > 300) {
            throw new RuntimeException("Tiểu sử tối đa 300 ký tự");
        }

        if (req.getPositons().size() > 3) {
            throw new RuntimeException("chi duoc chon 3 vi tri ");
        }

        // Validate tổng số lượng công nghệ trong Map techTags
        if (req.getTechTags() != null) {
            // Gom tất cả các phần tử trong các mảng con lại để đếm tổng số tag thực tế
            long totalTags = req.getTechTags().values().stream()
                    .mapToLong(List::size)
                    .sum();
            if (totalTags > 10) {
                throw new RuntimeException("Chỉ được chọn tối đa 10 công nghệ");
            }
        }

        if (req.getTopics() != null && req.getTopics().size() > 10) {
            throw new RuntimeException("Chỉ được chọn tối đa 10 chủ đề");
        }

        if (req.getCvLink() != null) {
            String cvLink = req.getCvLink().trim();

            if (!cvLink.isEmpty()
                    && !cvLink.startsWith("http://")
                    && !cvLink.startsWith("https://")) {
                throw new RuntimeException("CV link không hợp lệ");
            }

            profile.setCvLink(cvLink.isEmpty() ? null : cvLink);
        }

        // --- 3. Map dữ liệu vào Entity ---
        profile.setBio(req.getBio());
        profile.setPositions(req.getPositons());
        profile.setCvLink(req.getCvLink());
        profile.setTechTags(req.getTechTags());
        profile.setTopics(req.getTopics());
        user.setStatus(UserStatus.PENDING_APPROVAL);
        studentprofileRepository.save(profile);
        // Nếu trong request có gửi kèm cvLink thì map luôn nhé (Entity của bạn chưa thấy khai báo cvLink nhưng DTO có)
        // profile.setCvLink(req.getCvLink());
        StudentProfileResponse res = new StudentProfileResponse();
        res.setId(profile.getId());
        res.setImg_studentcard(profile.getImg_studentcard());
        res.setBio(profile.getBio());
        res.setPositions(profile.getPositions());
        res.setTechTags(profile.getTechTags());
        res.setTopics(profile.getTopics());
        res.setAvatar(profile.getAvatar())
        ;
        res.setStatus(UserStatus.PENDING_APPROVAL.toString());

        return res;
    }


    private String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        return String.join(",", values);
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ảnh hồ sơ");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("Ảnh hồ sơ tối đa 2MB");
        }

        String type = file.getContentType();

        if (!"image/jpeg".equals(type) && !"image/png".equals(type)) {
            throw new RuntimeException("Ảnh hồ sơ chỉ hỗ trợ JPG hoặc PNG");
        }
    }

    public Map<String, Object> updateAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        validateAvatar(file);

        String img = cloudinaryStorageService.uploadAvatar(file, user.getId());
        user.setAvt_img(img);
        userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("avatarUrl", img);

        return response;
    }


    // Hàm helper xử lý upload file lên Cloudinary độc lập
    private String uploadToCloudinary(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi upload ảnh hệ thống: " + e.getMessage());
        }
    }

    public List<AdminParticipantReviewResponse> getAllinformationUser() {
        return userRepository.findByRole(Role.USER)
                .stream()
                .map(user -> {
                    UserIdentityProfile identity = profileRepository.findByUserId(user.getId())
                            .orElse(null);
                    Student_profile studentProfile = studentprofileRepository.findByUserId(user.getId()).orElse(null);

                    return AdminParticipantReviewResponse.builder()
                            .userId(user.getId())
                            .fullname(user.getFullName())
                            .email(user.getEmail())
                            .phone(user.getPhoneNumber())
                            .avatar(user.getAvt_img())
                            .status(user.getStatus())

                            //cccd
                            .fullnameCccd(identity != null ? identity.getFullName() : null)
                            .cccd(identity != null ? identity.getCmnd() : null)
                            .dateofbirth(identity != null ? identity.getDateOfBirth() : null)
                            .gender(identity != null ? identity.getGender() : null)
                            .thuongtru(identity != null ? identity.getThuongtru() : null)
                            .frontcccd(identity != null ? identity.getFrontcmnd_img() : null)
                            .backcccd(identity != null ? identity.getCmndBack_image() : null)

                            //thong tin sinh vien
                            .mssv(user.getStudentId())
                            .SchoolName(user.getSchoolName())
                            .StudentCartImg(studentProfile != null ? studentProfile.getImg_studentcard() : null)
                            .build();

                })
                .toList();
    }
}



