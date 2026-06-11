package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.LoginRequest;
import com.minhtung.hackathon.dto.response.LoginResponse;
import com.minhtung.hackathon.dto.request.RegisterRequest;
import com.minhtung.hackathon.dto.response.RegisterResponse;
import com.minhtung.hackathon.dto.request.CompleteProfileRequest;
import com.minhtung.hackathon.dto.response.CompleteProfileResponse;
import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.MemberStatus;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.repository.MemberRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private MemberRepository memberRepository;

    // nếu không verify thi sau .... xoa
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return null;
        }
        //xoa pending cu neu co (Dang ki lai)
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setRole(Role.USER);
        user.setSchoolName(registerRequest.getSchoolName());
        user.setActive(false);//chua an xac nhan
        user.setToken(UUID.randomUUID().toString());
        user.setExpiredAt(LocalDateTime.now().plusMinutes(15));
        user.setRole(Role.USER);
        userRepository.save(user);
        RegisterResponse registerResponse = new RegisterResponse();
        registerResponse.setStudentId(registerRequest.getStudentId());
        registerResponse.setEmail(registerRequest.getEmail());
        registerResponse.setSchoolName(registerRequest.getSchoolName());
        boolean sent = emailService.sendVerificationEmail(registerRequest.getEmail(), user.getToken());
        return sent
                ? registerResponse
                : null;
    }

    //    ham resend email
    public String resendEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        user.get().setToken(UUID.randomUUID().toString());
        user.get().setExpiredAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user.get());
        boolean sent = emailService.sendVerificationEmail(email, user.get().getToken());
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
        user.setToken(null);
        user.setExpiredAt(null);
        userRepository.save(user);

        return "\"\"\"\n" +
                "            Link đã hết hạn.\n" +
                "            <a href=\"http://localhost:5173/complete-profile\">\n" +
                "                Bam Vao Day De Hoan Thien Thong tin\n" +
                "            </a>\n" +
                "            \"\"\"";
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


    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail((req.getEmail())).orElse(null);
        Member member = memberRepository.findByMemberIdAndStatusIn(user.getId(), List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE)).orElse(null);
        String teamRole = "";
        boolean hasTeam = false;
        if (member == null) {
            teamRole = "NOTEAMROLE";
            hasTeam = false;
        } else if (member.getRole() == MemberRole.LEADER) {
            teamRole = "LEADER";
            hasTeam = true;
        } else if (member.getRole() == MemberRole.MEMBER) {
            teamRole = "MEMBER";
            hasTeam = true;
        }

        if (user == null) {
            return new LoginResponse(null, null, null, "tai khoan khong ton tai ", null, false, null,0);

        }
        if (!user.isActive()) {
            return new LoginResponse(null, null, null, "tai khoan chua duoc kich hoat email ", null, false, null,0);
        }
        if (!req.getPassword().equals(user.getPassword())) {
            return new LoginResponse(null, null, null, "Mat khau khong chinh xac", null, false, null,0);
        }
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        long expiredTime=jwtUtil.getExpiredTime();
        return new LoginResponse(
                jwt,
                user.getRole().name(),
                user.getEmail(),
                "Dang nhap thanh cong", user.getFullName(), hasTeam, teamRole, expiredTime
        );
    }


}
