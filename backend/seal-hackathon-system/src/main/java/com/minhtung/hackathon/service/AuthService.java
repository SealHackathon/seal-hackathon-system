package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.LoginRequest;
import com.minhtung.hackathon.dto.request.UpdateEmailRequest;
import com.minhtung.hackathon.dto.response.LoginResponse;
import com.minhtung.hackathon.dto.request.RegisterRequest;
import com.minhtung.hackathon.dto.response.RegisterResponse;
import com.minhtung.hackathon.dto.request.CompleteProfileRequest;
import com.minhtung.hackathon.dto.response.CompleteProfileResponse;
import com.minhtung.hackathon.dto.response.UpdateEmailResponse;
import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.University;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.enums.UserStatus;
import com.minhtung.hackathon.repository.MemberRepository;
import com.minhtung.hackathon.repository.UniversityRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final UniversityRepository universityRepository;
    @Autowired
    private MemberRepository memberRepository;

    // nếu không verify thi sau .... xoa
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("email nay da ton tai ");
        }
        if(userRepository.existsByPhoneNumber(registerRequest.getPhone())){
            throw new RuntimeException(" số điện thoại này  đã tồn tại ");
        }
        if(userRepository.existsByStudentId(registerRequest.getStudentId())){
            throw new RuntimeException("MSSV đã  tồn tại " );
        }

        if(registerRequest.getPassword() == null ||registerRequest.getPassword().length() <  6 ){
            throw new RuntimeException("passsword phai tren 6 ki tu ");
        }
        if(registerRequest.getEmail() == null){
            throw new RuntimeException("khong duoc de trong") ;
        }

        if(registerRequest.getEmail()== null){
            throw new RuntimeException("khong duoc de trong") ;
        }
        if(registerRequest.getStudentId() == null){
            throw new RuntimeException("khong duoc de trong") ;
        }


        // check xem truong co ton tai trong DB khong
//        University university = universityRepository.findByName(registerRequest.getSchoolName().trim()).orElseThrow(() -> new RuntimeException("truong dai học khong ton tai"));
//        validateMssv(university, registerRequest.getStudentId());
        //xoa pending cu neu co (Dang ki lai)
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setRole(Role.USER);
        user.setSchoolName(registerRequest.getSchoolName());
        user.setActive(false);//chua an xac nhan
        user.setToken(UUID.randomUUID().toString());
        user.setExpiredAt(LocalDateTime.now().plusMinutes(15));
        user.setStatus(UserStatus.PROFILE_PENDING);
        user.setRole(Role.USER);
        user.setUniversity(null);
        user.setSchoolName(registerRequest.getSchoolName());
        user.setStudentId(registerRequest.getStudentId().trim().toUpperCase());
        user.setPhoneNumber(registerRequest.getPhone());
        userRepository.save(user);
        RegisterResponse registerResponse = new RegisterResponse();
        registerResponse.setStudentId(registerRequest.getStudentId());
        registerResponse.setEmail(registerRequest.getEmail());
        registerResponse.setSchoolName(registerRequest.getSchoolName());
        registerResponse.setPhone(registerRequest.getPhone());
        boolean sent = emailService.sendVerificationEmail(registerRequest.getEmail(), user.getToken());
        return sent
                ? registerResponse
                : null;
    }

    //    ham resend email
    public String resendEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (user.isActive()) {
            return "tai khoan da kich hoat";
        }
        LocalDateTime now = LocalDateTime.now();

        if (user.getLastVerificationEmailSentAt() != null &&
                user.getLastVerificationEmailSentAt().plusMinutes(2).isAfter(now)) {
            return "Vui lòng chờ 2 phút trước khi gửi lại email";
        }

        //reset ham dem cho ngay moi

        if (user.getResendEmailCountDate() == null ||
                !user.getResendEmailCountDate().equals(LocalDate.now())) {
            user.setResendEmailCount(0);
            user.setResendEmailCountDate(LocalDate.now());
        }

        if (user.getResendEmailCount() != null && user.getResendEmailCount() >= 5) {
            return "Bạn đã gửi lại email quá số lần cho phép trong ngày";
        }
        user.setToken(UUID.randomUUID().toString());
        //link se het han sau 15p
        user.setExpiredAt(now.plusMinutes(15));
        user.setLastVerificationEmailSentAt(now);
        user.setResendEmailCount(
                user.getResendEmailCount() == null ? 1 : user.getResendEmailCount() + 1
        );
        user.setResendEmailCountDate(LocalDate.now());
        userRepository.save(user);
        boolean sent = emailService.sendVerificationEmail(email, user.getToken());
        return sent
                ? "Da resend email thanh cong"
                : "resend that bai";
    }

    //buoc 2 thuc hien o day gui gmail va an xac nhan
    @Transactional
    public String verifyEmail(String token) {
        User user = userRepository.findByToken(token).orElse(null);

        if (user == null) {
            return "Token khong hop le ";

        }
        if (user.isExpired()) {
            userRepository.delete(user);
            return "Link da het han . Vui long dang ki lai";
        }

        user.setActive(true);
        user.setStatus(UserStatus.PROFILE_PENDING);
        user.setToken(null);
        user.setStatus(UserStatus.PROFILE_PENDING);
        user.setExpiredAt(null);
        userRepository.save(user);

        return """
            <script>window.location.href = "http://localhost:5173/verified-email";</script>
            """;
    }

    //Complete prfile

    public CompleteProfileResponse completeProfile(CompleteProfileRequest req) {
        Optional<User> user = userRepository.findByEmail(req.getEmail());
        if (user.isPresent()) {
            user.get().setFullName(req.getFullName());
            return new CompleteProfileResponse(true, "Hoan Thien Ho So Thanh Cong");
        }
        return new CompleteProfileResponse(false, "Hoan Thien Ho So Khong Thanh Cong");
    }

    //login
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail((req.getEmail())).orElse(null);

        String teamRole = null;
        boolean hasTeam = false;

        // Lấy team member của user
        Member member = memberRepository.findByMemberIdAndStatusIn(user.getId(), List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE)).orElse(null);
        if (member != null) {
            hasTeam = true;
            teamRole = member.getRole().name(); // "LEADER" | "MEMBER"
        }

        if (user == null) {
            return new LoginResponse(null, null, null, "tai khoan khong ton tai ", null, false, null, 0, null);

        }
        if (!user.isActive()) {
            return new LoginResponse(null, null, null, "tai khoan chua duoc kich hoat email ", null, false, null, 0, null);
        }
        if (!req.getPassword().equals(user.getPassword())) {
            //passwordEncoder.encode(req.getPassword())
            return new LoginResponse(null, null, null, "Mat khau khong chinh xac", null, false, null, 0, null);
        }
        if (!req.getEmail().equals(user.getEmail())) {
            return new LoginResponse(null, null, null, "tai khoan  khong chinh xac", null, false, null, 0, null);
        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new RuntimeException("tai khoan cua ban da bị khoa");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new RuntimeException("ho so da bi tu choi duyệt ");
        }
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        long expiredTime = jwtUtil.getExpiredTime();
        return new LoginResponse(
                jwt,
                user.getRole().name(),
                user.getEmail(),
                "Dang nhap thanh cong",
                user.getFullName(),
                hasTeam,
                teamRole,
                expiredTime,
                user.getStatus()
        );
    }

    private void validateMssv(University university, String studendid) {
        if (studendid == null || studendid.isEmpty()) {
            throw new RuntimeException("xin moi nhap mssv");
        }

        if (!university.isCheckMssv()) {
            return;
        }

        String mssv = studendid.trim().toUpperCase();
        if (!(mssv.startsWith("SS") || mssv.startsWith("SE"))) {

            throw new RuntimeException("mssv cua truong phai theo dung format ");
        }
    }
    public UpdateEmailResponse updateEmail(UpdateEmailRequest requestt){
        String email = requestt.getNewEmail();
        User user = userRepository.findByEmail(requestt.getCurrentEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if(user.isActive()){
            throw new RuntimeException(" đã kich hoạt email rồi   ") ;
        }
        if(user.getEmail().equalsIgnoreCase(email)){
            throw new  RuntimeException("email moi trung voi email cu ");
        }

        if(userRepository.existsByEmail(email)){
            throw new RuntimeException("email mới đã được sử dụng bởi tài khoản khác");

        }
        user.setEmail(email);
        userRepository.save(user);
        return new UpdateEmailResponse(true , email,"cập nhật thành công " );
    }

}
