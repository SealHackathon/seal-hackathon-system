package com.minhtung.hackathon.config;

import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.service.TeamService;
import lombok.RequiredArgsConstructor;
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
            User user1 = new User();
            user1.setEmail("user1@gmail.com");
            user1.setPassword("123456");
            user1.setRole(Role.USER);
            user1.setSchoolName("Trường đại học Hoa Sen");
            user1.setActive(true);
            user1.setFullName("Bui Thien Khanh");
            userRepository.save(user1);

            User user2 = new User();
            user2.setEmail("user2@gmail.com");
            user2.setPassword("123456");
            user2.setRole(Role.USER);
            user2.setSchoolName("Khoa Học Xã Hội và Nhân Văn");
            user2.setActive(true);
            user2.setFullName("Mac Minh Tung");
            userRepository.save(user2);

            User user3 = new User();
            user3.setEmail("user3@gmail.com");
            user3.setPassword("123456");
            user3.setRole(Role.USER);
            user3.setSchoolName("Trường đại học FPT");
            user3.setActive(true);
            user3.setFullName("Pham Khac Dang Khoa");
            userRepository.save(user3);

            User user4 = new User();
            user4.setEmail("user4@gmail.com");
            user4.setPassword("123456");
            user4.setRole(Role.USER);
            user4.setSchoolName("Trường đại học Công Nghiệp");
            user4.setActive(true);
            user4.setFullName("Nguyen Thanh Thai");
            userRepository.save(user4);

            User user5 = new User();
            user5.setFullName("Ho Ngoc Bao Tran");
            user5.setEmail("user5@gmail.com");
            user5.setPassword("123456");
            user5.setRole(Role.USER);
            user5.setSchoolName("Trường đại học Bách Khoa HCM");
            user5.setActive(true);
            userRepository.save(user5);
            List<String> emails = new ArrayList<>();
            emails.add("user3@gmail.com"); //gửi invitation đến user1
            emails.add("user2@gmail.com"); // gửi in..... đến user 2
            teamService.createTeam(new CreateTeamDto(
                    "Team của Bảo Trân","Đây là team của Bảo Trân ạ.",emails
                    ), user5.getId());
//
//            teamService.createTeam(new CreateTeamDto(
//                    "Team của Khanh","Đây là team của Khanh ạ.", Collections.emptyList()
//            ), user1.getId());
            //hard code cho user2 vào team bằng mã team
//            teamService.joinTeamByCode(
//                    teamRepository.findByLeaderID(user5.getId()).get().getInviteCode(),
//                    user2.getId()
//            );
//            //hard code cho user4 send 1 join team request chờ ad duyệt
            teamService.sendJoinRequest(
                    new JoinTeamRequest(
                            teamRepository.findByLeaderID(user5.getId()).get().getId()
                            , "Khoa xin vào đội ạ"),
                    user3.getId()
            );

        }
    }
}
