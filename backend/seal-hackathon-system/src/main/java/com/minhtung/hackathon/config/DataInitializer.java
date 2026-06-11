package com.minhtung.hackathon.config;

import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.C;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final TeamService teamService;
    @Autowired
    private final TeamRepository teamRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
//           ----------------các thành viên chưa có team----------------------------------
            User user1 = new User();
            user1.setEmail("user1@gmail.com");
            user1.setPassword("123456");
            user1.setRole(Role.USER);
            user1.setSchoolName("Trường đại học Hoa Sen");
            user1.setActive(true);
            user1.setFullName("Bùi Thiên Khánh");
            userRepository.save(user1);
//
//            User user2 = new User();
//            user2.setEmail("user2@gmail.com");
//            user2.setPassword("123456");
//            user2.setRole(Role.USER);
//            user2.setSchoolName("Khoa Học Xã Hội và Nhân Văn");
//            user2.setActive(true);
//            user2.setFullName("Mạc Minh Tùng");
//            userRepository.save(user2);
//
//            User user3 = new User();
//            user3.setEmail("user3@gmail.com");
//            user3.setPassword("123456");
//            user3.setRole(Role.USER);
//            user3.setSchoolName("Trường đại học FPT");
//            user3.setActive(true);
//            user3.setFullName("Phạm Khắc Đăng Khoa");
//            userRepository.save(user3);
//
//            User user4 = new User();
//            user4.setEmail("user4@gmail.com");
//            user4.setPassword("123456");
//            user4.setRole(Role.USER);
//            user4.setSchoolName("Trường đại học Công Nghiệp");
//            user4.setActive(true);
//            user4.setFullName("Nguyễn Thành Thái");
//            userRepository.save(user4);
//
//            User user5 = new User();
//            user5.setFullName("Hồ Ngọc Bảo Trân");
//            user5.setEmail("user5@gmail.com");
//            user5.setPassword("123456");
//            user5.setRole(Role.USER);
//            user5.setSchoolName("Trường đại học Bách Khoa HCM");
//            user5.setActive(true);
//            userRepository.save(user5);
//            //  ----------------team 4 đã đủ maxSlot-----------------------
//
//            User user6 = new User();
//            user6.setFullName("Nguyễn Văn Leader Team Một");
//            user6.setEmail("user11@gmail.com");
//            user6.setPassword("123456");
//            user6.setRole(Role.USER);
//            user6.setSchoolName("Trường đại học Bách Khoa HCM");
//            user6.setActive(true);
//            userRepository.save(user6);
//            User user7 = new User();
//            user7.setFullName("Nguyễn Văn Member2 Team Một");
//            user7.setEmail("user12@gmail.com");
//            user7.setPassword("123456");
//            user7.setRole(Role.USER);
//            user7.setSchoolName("Trường đại học Bách Khoa HCM");
//            user7.setActive(true);
//            userRepository.save(user7);
//            User user8 = new User();
//            user8.setFullName("Nguyễn Văn Member3 Team Một");
//            user8.setEmail("user13@gmail.com");
//            user8.setPassword("123456");
//            user8.setRole(Role.USER);
//            user8.setSchoolName("Trường đại học Bách Khoa HCM");
//            user8.setActive(true);
//            userRepository.save(user8);
//            User user9 = new User();
//            user9.setFullName("Nguyễn Văn Member4 Team Một");
//            user9.setEmail("user14@gmail.com");
//            user9.setPassword("123456");
//            user9.setRole(Role.USER);
//            user9.setSchoolName("Trường đại học Bách Khoa HCM");
//            user9.setActive(true);
//            userRepository.save(user9);
//            teamService.createTeam(new CreateTeamDto(
//                    "SEAL HACKER", "Chào bạn bọn mình là sinh viên năm 3 chuyên nghành ATTT.", Collections.emptyList()
//            ), user6.getId());
//            teamService.joinTeamByCode(
//                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(),user7.getId());
//            teamService.joinTeamByCode(
//                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(),user8.getId());
//            teamService.joinTeamByCode(
//                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(),user9.getId());
//
////            ------team 2 đang có 2 thành viên-------
//                    User user10 = new User();
//            user10.setFullName("Nguyễn Văn Leader Team Hi");
//            user10.setEmail("usert21@gmail.com");
//            user10.setPassword("123456");
//            user10.setRole(Role.USER);
//            user10.setSchoolName("Trường đại học FPT");
//            user10.setActive(true);
//            userRepository.save(user10);
//            User user11 = new User();
//            user11.setFullName("Nguyễn Văn Member Team Hi");
//            user11.setEmail("usert22@gmail.com");
//            user11.setPassword("123456");
//            user11.setRole(Role.USER);
//            user11.setSchoolName("Trường đại học FPT");
//            user11.setActive(true);
//            userRepository.save(user11);
//            teamService.createTeam(new CreateTeamDto(
//                    "FPT CÓC CAM", "Nhóm mình tìm kiếm 1 bạn nữ frontend (không frontend cũng được), để quản lý tụi mình ạ.", Collections.emptyList()
//            ), user10.getId());
//            teamService.joinTeamByCode(
//                    teamRepository.findByLeaderId(user10.getId()).get().getInviteCode(),user11.getId());
//
//
//            User user12 = new User();
//            user12.setFullName("ADMIN");
//            user12.setEmail("admin@gmail.com");
//            user12.setPassword("123456");
//            user12.setRole(Role.USER);
//            user12.setActive(true);
//            userRepository.save(user12);
        }
    }
}
