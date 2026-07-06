package com.minhtung.hackathon.config;

import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.entity.Student_profile;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.enums.UserStatus;
import com.minhtung.hackathon.repository.StudentprofileRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.service.TeamService;
import com.minhtung.hackathon.service.UserService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.C;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final TeamRepository teamRepository;
    private final StudentprofileRepository studentprofileRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
//           ----------------các thành viên chưa có team----------------------------------

//
//            User u4 = new User();
//            u4.setEmail("le.minh.tri@uit.edu.vn");
//            u4.setPassword("123456");
//            u4.setFullName("TS. Lê Minh Trí");
//            u4.setTitle("Trưởng khoa CNTT");
//            u4.setOrg("UIT");
//            u4.setRole(Role.LECTURER);
//            u4.setActive(true);
//            u4.setStatus(UserStatus.ACCEPTED);
//
//            User u5 = new User();
//            u5.setEmail("pham.thi.lan@vinai.io");
//            u5.setPassword("123456");
//            u5.setFullName("ThS. Phạm Thị Lan");
//            u5.setTitle("AI Research Engineer");
//            u5.setOrg("VinAI Research");
//            u5.setRole(Role.LECTURER);
//            u5.setActive(true);
//            u5.setStatus(UserStatus.ACCEPTED);
//
//            User u6 = new User();
//            u6.setEmail("hoang.van.minh@hcmut.edu.vn");
//            u6.setPassword("123456");
//            u6.setFullName("PGS. Hoàng Văn Minh");
//            u6.setTitle("Phó Giáo sư");
//            u6.setOrg("Đại học Bách Khoa HCM");
//            u6.setRole(Role.LECTURER);
//            u6.setActive(true);
//            u6.setStatus(UserStatus.ACCEPTED);
//
//            User u7 = new User();
//            u7.setEmail("nguyen.thi.hong@zalo.me");
//            u7.setPassword("123456");
//            u7.setFullName("ThS. Nguyễn Thị Hồng");
//            u7.setTitle("Tech Lead");
//            u7.setOrg("Zalo");
//            u7.setRole(Role.LECTURER);
//            u7.setActive(true);
//            u7.setStatus(UserStatus.ACCEPTED);
//
//            User u8 = new User();
//            u8.setEmail("tran.quoc.bao@momo.vn");
//            u8.setPassword("123456");
//            u8.setFullName("TS. Trần Quốc Bảo");
//            u8.setTitle("CTO");
//            u8.setOrg("MoMo");
//            u8.setRole(Role.LECTURER);
//            u8.setActive(true);
//            u8.setStatus(UserStatus.ACCEPTED);

//            userRepository.saveAll(java.util.List.of(u4, u5, u6, u7, u8));

            User user1 = new User();
            user1.setEmail("user1@gmail.com");
            user1.setPassword("123456");
            user1.setRole(Role.USER);
            user1.setSchoolName("Trường đại học Hoa Sen");
            user1.setActive(true);
            user1.setFullName("Bùi Thiên Khánh");
            user1.setStatus(UserStatus.ACCEPTED);
            userRepository.save(user1);

            User user2 = new User();
            user2.setEmail("user2@gmail.com");
            user2.setPassword("123456");
            user2.setRole(Role.USER);
            user2.setSchoolName("Khoa Học Xã Hội và Nhân Văn");
            user2.setActive(true);

            user2.setFullName("Mạc Minh Tùng");
            user2.setStatus(UserStatus.ACCEPTED);

            userRepository.save(user2);


            User user3 = new User();
            user3.setEmail("user3@gmail.com");
            user3.setPassword("123456");
            user3.setRole(Role.USER);
            user3.setSchoolName("Trường đại học FPT");
            user3.setActive(true);
            user3.setStatus(UserStatus.ACCEPTED);

            user3.setFullName("Phạm Khắc Đăng Khoa");

            userRepository.save(user3);

            User user4 = new User();
            user4.setEmail("user4@gmail.com");
            user4.setPassword("123456");
            user4.setRole(Role.USER);
            user4.setSchoolName("Trường đại học Công Nghiệp");
            user4.setActive(true);
            user4.setFullName("Nguyễn Thành Thái");
            user4.setStatus(UserStatus.ACCEPTED);

            userRepository.save(user4);

            User user5 = new User();
            user5.setFullName("Hồ Ngọc Bảo Trân");
            user5.setEmail("user5@gmail.com");
            user5.setPassword("123456");
            user5.setRole(Role.USER);
            user5.setStatus(UserStatus.ACCEPTED);
            user5.setSchoolName("Trường đại học Bách Khoa HCM");
            user5.setActive(true);
            userRepository.save(user5);

            //------------------------HARD CODE PROFILE USER 1 - 5---------------------------
            Student_profile profile1 = new Student_profile();
            profile1.setUser(user1); // Bùi Thiên Khánh
            profile1.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với các công nghệ Frontend như React và Vue, luôn thích tối ưu hóa UI/UX để mang lại trải nghiệm tốt nhất.");
            profile1.setPositions(List.of("Frontend Developer"));
            profile1.setTechTags(Map.of(
                    "frontend", List.of("React", "Vue", "Tailwind CSS")
            ));
            profile1.setTopics(List.of("Web Development", "Frontend Architecture"));
            studentprofileRepository.save(profile1);

            Student_profile profile2 = new Student_profile();
            profile2.setUser(user2); // Mạc Minh Tùng
            profile2.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình chuyên về phía Backend, có kinh nghiệm làm việc với Java, Spring Boot và quản trị cơ sở dữ liệu MySQL, Redis.");
            profile2.setPositions(List.of("Backend Developer"));
            profile2.setTechTags(Map.of(
                    "backend", List.of("Java", "Spring Boot", "MySQL", "Redis")
            ));
            profile2.setTopics(List.of("System Design", "Cloud Computing"));
            studentprofileRepository.save(profile2);

            Student_profile profile3 = new Student_profile();
            profile3.setUser(user3); // Phạm Khắc Đăng Khoa
            profile3.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình đam mê học hỏi các công nghệ web mới, chuyên phát triển Frontend với React và luôn sẵn sàng hỗ trợ team.");
            profile3.setPositions(List.of("Frontend Developer"));
            profile3.setTechTags(Map.of(
                    "frontend", List.of("React", "JavaScript", "HTML/CSS")
            ));
            profile3.setTopics(List.of("Web Development", "Creative Coding"));
            studentprofileRepository.save(profile3);

            Student_profile profile4 = new Student_profile();
            profile4.setUser(user4); // Nguyễn Thành Thái
            profile4.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.");
            profile4.setPositions(List.of("Frontend Developer"));
            profile4.setTechTags(Map.of(
                    "frontend", List.of("React", "Next.js", "Tailwind CSS"),
                    "backend", List.of("Spring Boot")
            ));
            profile4.setTopics(List.of("Web Development"));
            studentprofileRepository.save(profile4);

            Student_profile profile5 = new Student_profile();
            profile5.setUser(user5); // Hồ Ngọc Bảo Trân
            profile5.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình yêu thích sự kết hợp giữa thiết kế và công nghệ, đảm nhận tốt cả hai vai trò Frontend Developer và UI/UX Designer.");
            profile5.setPositions(List.of("Frontend Developer", "UI/UX Designer"));
            profile5.setTechTags(Map.of(
                    "frontend", List.of("React", "Tailwind CSS"),
                    "design", List.of("Figma", "Adobe XD")
            ));
            profile5.setTopics(List.of("UI/UX Design", "Web Development"));
            studentprofileRepository.save(profile5);

//            --------------------------------------------------------------
//
//              ----------------team 4 đã đủ maxSlot-----------------------

            User user6 = new User();
            user6.setFullName("Nguyễn Văn Leader Team Một");
            user6.setEmail("user11@gmail.com");
            user6.setPassword("123456");
            user6.setStatus(UserStatus.ACCEPTED);

            user6.setRole(Role.USER);
            user6.setSchoolName("Trường đại học Bách Khoa HCM");
            user6.setActive(true);
            userRepository.save(user6);
            User user7 = new User();
            user7.setFullName("Nguyễn Văn Member2 Team Một");
            user7.setEmail("user12@gmail.com");
            user7.setPassword("123456");
            user7.setStatus(UserStatus.ACCEPTED);

            user7.setRole(Role.USER);
            user7.setSchoolName("Trường đại học Bách Khoa HCM");
            user7.setActive(true);
            userRepository.save(user7);
            User user8 = new User();
            user8.setFullName("Nguyễn Văn Member3 Team Một");
            user8.setEmail("user13@gmail.com");
            user8.setPassword("123456");
            user8.setRole(Role.USER);
            user8.setStatus(UserStatus.ACCEPTED);

            user8.setSchoolName("Trường đại học Bách Khoa HCM");
            user8.setActive(true);
            userRepository.save(user8);
            User user9 = new User();
            user9.setFullName("Nguyễn Văn Member4 Team Một");
            user9.setEmail("user14@gmail.com");
            user9.setPassword("123456");
            user9.setStatus(UserStatus.ACCEPTED);

            user9.setRole(Role.USER);
            user9.setSchoolName("Trường đại học Bách Khoa HCM");
            user9.setActive(true);
            userRepository.save(user9);
            teamService.createTeam(new CreateTeamDto(
                    "SEAL HACKER", "Chào bạn bọn mình là sinh viên năm 3 chuyên nghành ATTT.", Collections.emptyList()
            ), user6.getId());
            teamService.joinTeamByCode(
                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user7.getId());
            teamService.joinTeamByCode(
                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user8.getId());
            teamService.joinTeamByCode(
                    teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user9.getId());

//            ------team 2 đang có 2 thành viên-------
            User user10 = new User();
            user10.setFullName("Nguyễn Văn Leader Team Hi");
            user10.setEmail("usert21@gmail.com");
            user10.setPassword("123456");
            user10.setRole(Role.USER);
            user10.setStatus(UserStatus.ACCEPTED);

            user10.setSchoolName("Trường đại học FPT");
            user10.setActive(true);
            userRepository.save(user10);
            User user11 = new User();
            user11.setFullName("Nguyễn Văn Member Team Hi");
            user11.setEmail("usert22@gmail.com");
            user11.setPassword("123456");
            user11.setRole(Role.USER);
            user11.setStatus(UserStatus.ACCEPTED);

            user11.setSchoolName("Trường đại học FPT");
            user11.setActive(true);
            userRepository.save(user11);
            teamService.createTeam(new CreateTeamDto(
                    "FPT CÓC CAM", "Nhóm mình tìm kiếm 1 bạn nữ frontend (không frontend cũng được), để quản lý tụi mình ạ.", Collections.emptyList()
            ), user10.getId());
            teamService.joinTeamByCode(
                    teamRepository.findByLeaderId(user10.getId()).get().getInviteCode(), user11.getId());


            User user12 = new User();
            user12.setFullName("ADMIN");
            user12.setEmail("admin@gmail.com");
            user12.setPassword("123456");
            user12.setRole(Role.ADMIN);
            user12.setActive(true);
            user12.setStatus(UserStatus.ACCEPTED);
            userRepository.save(user12);
        }
    }
}
