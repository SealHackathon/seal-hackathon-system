package com.minhtung.hackathon.config;

import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final StudentprofileRepository studentprofileRepository;
    private final EventRepository eventRepository;
    private final SystemRequestRepository systemRequestRepository;
    private final ScoringTemplateRepository templateRepository;
    private final MemberRepository memberRepository;

    // Bộ nhớ tạm lưu trữ: Email của Mentor -> Tập hợp các TrackId được giao làm Mentor
    private final Map<String, Set<Long>> mentorTrackMapping = new HashMap<>();

    // Class cấu trúc nhỏ dùng để map cặp Track và Round cho Judge
    private record JudgeAssignment(Long trackId, Long roundId) {
    }

    @Override
    public void run(String... args) {
        // ==================== KHỞI TẠO TÀI KHOẢN HỆ THỐNG ====================
        if (userRepository.count() == 0) {
            // Tài khoản Lecturer ban đầu
            User u4 = new User();
            u4.setEmail("le.minh.tri@uit.edu.vn");
            u4.setPassword("123456");
            u4.setFullName("TS. Lê Minh Trí");
            u4.setTitle("Trưởng khoa CNTT");
            u4.setOrg("UIT");
            u4.setRole(Role.LECTURER);
            u4.setActive(true);
            u4.setStatus(UserStatus.ACCEPTED);

            User u5 = new User();
            u5.setEmail("pham.thi.lan@vinai.io");
            u5.setPassword("123456");
            u5.setFullName("ThS. Phạm Thị Lan");
            u5.setTitle("AI Research Engineer");
            u5.setOrg("VinAI Research");
            u5.setRole(Role.LECTURER);
            u5.setActive(true);
            u5.setStatus(UserStatus.ACCEPTED);

            User u6 = new User();
            u6.setEmail("hoang.van.minh@hcmut.edu.vn");
            u6.setPassword("123456");
            u6.setFullName("PGS. Hoàng Văn Minh");
            u6.setTitle("Phó Giáo sư");
            u6.setOrg("Đại học Bách Khoa HCM");
            u6.setRole(Role.LECTURER);
            u6.setActive(true);
            u6.setStatus(UserStatus.ACCEPTED);

            User u7 = new User();
            u7.setEmail("nguyen.thi.hong@zalo.me");
            u7.setPassword("123456");
            u7.setFullName("ThS. Nguyễn Thị Hồng");
            u7.setTitle("Tech Lead");
            u7.setOrg("Zalo");
            u7.setRole(Role.LECTURER);
            u7.setActive(true);
            u7.setStatus(UserStatus.ACCEPTED);

            User u8 = new User();
            u8.setEmail("tran.quoc.bao@momo.vn");
            u8.setPassword("123456");
            u8.setFullName("TS. Trần Quốc Bảo");
            u8.setTitle("CTO");
            u8.setOrg("   ");
            u8.setRole(Role.LECTURER);
            u8.setActive(true);
            u8.setStatus(UserStatus.ACCEPTED);

            // 4 tài khoản Lecturer bổ sung để phủ các bảng đấu
            User uNew1 = new User();
            uNew1.setEmail("nguyen.van.a@fpt.edu.vn");
            uNew1.setPassword("123456");
            uNew1.setFullName("TS. Nguyễn Văn A");
            uNew1.setTitle("Giảng viên Blockchain");
            uNew1.setOrg("Đại học FPT");
            uNew1.setRole(Role.LECTURER);
            uNew1.setActive(true);
            uNew1.setStatus(UserStatus.ACCEPTED);

            User uNew2 = new User();
            uNew2.setEmail("tran.thi.b@fpt.edu.vn");
            uNew2.setPassword("123456");
            uNew2.setFullName("ThS. Trần Thị B");
            uNew2.setTitle("Chuyên gia Mobile App");
            uNew2.setOrg("Đại học FPT");
            uNew2.setRole(Role.LECTURER);
            uNew2.setActive(true);
            uNew2.setStatus(UserStatus.ACCEPTED);

            User uNew3 = new User();
            uNew3.setEmail("vũ.hoang.c@fpt.edu.vn");
            uNew3.setPassword("123456");
            uNew3.setFullName("Chuyên gia Vũ Hoàng C");
            uNew3.setTitle("Solutions Architect");
            uNew3.setOrg("FPT Software");
            uNew3.setRole(Role.LECTURER);
            uNew3.setActive(true);
            uNew3.setStatus(UserStatus.ACCEPTED);

            User uNew4 = new User();
            uNew4.setEmail("dang.le.d@fpt.edu.vn");
            uNew4.setPassword("123456");
            uNew4.setFullName("TS. Đặng Lê D");
            uNew4.setTitle("Trưởng bộ môn An toàn thông tin");
            uNew4.setOrg("Đại học FPT");
            uNew4.setRole(Role.LECTURER);
            uNew4.setActive(true);
            uNew4.setStatus(UserStatus.ACCEPTED);

            userRepository.saveAll(List.of(u4, u5, u6, u7, u8, uNew1, uNew2, uNew3, uNew4));

            // Khởi tạo các User (Thí sinh)
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
            user4.setStatus(UserStatus.ACCEPTED);
            user4.setFullName("Nguyễn Thành Thái");
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

            // Khởi tạo Student Profiles tương ứng
            Student_profile profile1 = new Student_profile();
            profile1.setUser(user1);
            profile1.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với các công nghệ Frontend như React và Vue, luôn thích tối ưu hóa UI/UX để mang lại trải nghiệm tốt nhất.");
            profile1.setPositions(List.of("Frontend Developer"));
            profile1.setTechTags(Map.of("frontend", List.of("React", "Vue", "Tailwind CSS")));
            profile1.setTopics(List.of("Web Development", "Frontend Architecture"));
            studentprofileRepository.save(profile1);

            Student_profile profile2 = new Student_profile();
            profile2.setUser(user2);
            profile2.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình chuyên về phía Backend, có kinh nghiệm làm việc với Java, Spring Boot và quản trị cơ sở dữ liệu MySQL, Redis.");
            profile2.setPositions(List.of("Backend Developer"));
            profile2.setTechTags(Map.of("backend", List.of("Java", "Spring Boot", "MySQL", "Redis")));
            profile2.setTopics(List.of("System Design", "Cloud Computing"));
            studentprofileRepository.save(profile2);

            Student_profile profile3 = new Student_profile();
            profile3.setUser(user3);
            profile3.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình đam mê học hỏi các công nghệ web mới, chuyên phát triển Frontend với React và luôn sẵn sàng hỗ trợ team.");
            profile3.setPositions(List.of("Frontend Developer"));
            profile3.setTechTags(Map.of("frontend", List.of("React", "JavaScript", "HTML/CSS")));
            profile3.setTopics(List.of("Web Development", "Creative Coding"));
            studentprofileRepository.save(profile3);

            Student_profile profile4 = new Student_profile();
            profile4.setUser(user4);
            profile4.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.");
            profile4.setPositions(List.of("Frontend Developer"));
            profile4.setTechTags(Map.of("frontend", List.of("React", "Next.js", "Tailwind CSS"), "backend", List.of("Spring Boot")));
            profile4.setTopics(List.of("Web Development"));
            studentprofileRepository.save(profile4);

            Student_profile profile5 = new Student_profile();
            profile5.setUser(user5);
            profile5.setBio("Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình yêu thích sự kết hợp giữa thiết kế và công nghệ, đảm nhận tốt cả hai vai trò Frontend Developer và UI/UX Designer.");
            profile5.setPositions(List.of("Frontend Developer", "UI/UX Designer"));
            profile5.setTechTags(Map.of("frontend", List.of("React", "Tailwind CSS"), "design", List.of("Figma", "Adobe XD")));
            profile5.setTopics(List.of("UI/UX Design", "Web Development"));
            studentprofileRepository.save(profile5);

            User user12 = new User();
            user12.setFullName("ADMIN");
            user12.setEmail("admin@gmail.com");
            user12.setPassword("123456");
            user12.setRole(Role.ADMIN);
            user12.setActive(true);
            user12.setStatus(UserStatus.ACCEPTED);
            userRepository.save(user12);
        }

        // ==================== KHỞI TẠO SCORING TEMPLATE TRƯỚC ====================
        ScoringTemplate officialTemplate = null;
        if (templateRepository.count() == 0) {
            officialTemplate = initSampleScoringTemplates();
        } else {
            officialTemplate = templateRepository.findAll().stream()
                    .filter(t -> t.getStatus() == ScoringTemplateStatus.OFFICIAL)
                    .findFirst().orElse(null);
        }

        // ==================== KHỞI TẠO EVENT & GÁN TEMPLATE CHO ROUND ====================
        if (eventRepository.count() == 0) {
            User u1 = userRepository.findByEmail("user1@gmail.com").orElse(null);
            User u2 = userRepository.findByEmail("user2@gmail.com").orElse(null);
            User u3 = userRepository.findByEmail("user3@gmail.com").orElse(null);
            User u4 = userRepository.findByEmail("user4@gmail.com").orElse(null);
            User u5 = userRepository.findByEmail("user5@gmail.com").orElse(null);

            initSampleEvent(u1, u2, u3, u4, u5, officialTemplate);
        }
    }

    private void initSampleEvent(User user1, User user2, User user3, User user4, User user5, ScoringTemplate officialTemplate) {
        LocalDateTime now = LocalDateTime.now();

        // ========== STEP 1: Thông tin cơ bản Event ==========
        Event event = new Event();
        event.setName("SEAL Hackathon 2026 – AI for Good");
        event.setDescription("Cuộc thi hackathon dành cho sinh viên yêu thích AI, giải quyết bài toán thực tế cho cộng đồng.");
        event.setDescriptionDetail("SEAL Hackathon 2026 là sân chơi công nghệ dành cho sinh viên toàn quốc, " +
                "nơi các đội thi xây dựng giải pháp AI ứng dụng thực tế trong 48 giờ. " +
                "Sự kiện có sự đồng hành của các mentor và giám khảo đến từ VinAI, MoMo, Zalo, UIT, HCMUT.");
        event.setTopic("Trí tuệ nhân tạo vì cộng đồng");
        event.setMinTeamMember(3);
        event.setMaxTeamMember(5);
        event.setStatus(EventStatus.LIVE);
        event.setCreateAt(now);
        event.setOpenRegisterTime(now.plusDays(1));
        event.setCloseRegisterTime(now.plusDays(20));
        event.setCofirmTeamTime(now.plusDays(25));
        event.setBannerImg("https://placehold.co/1200x400?text=SEAL+Hackathon+2026");
        event.setThumbnail_image("https://placehold.co/400x400?text=SEAL+2026");
        event.setEventLocation("Đại học FPT TP.HCM");

        // ========== STEP 2: Quy định + Ghi chú ==========
        event.setRules("Mỗi đội từ 3-5 thành viên. Không được sao chép code từ đội khác. " +
                "Bài nộp phải là sản phẩm mới, phát triển trong thời gian diễn ra sự kiện.");

        List<EventNote> notes = new ArrayList<>();
        notes.add(new EventNote("Quy định nộp bài", "Bài nộp gồm source code (GitHub link) và video demo tối đa 5 phút.", event));
        notes.add(new EventNote("Chính sách gian lận", "Đội vi phạm sẽ bị loại khỏi cuộc thi ngay lập tức không cần báo trước.", event));
        event.setNotes(notes);

        // ========== STEP 3: Giải thưởng + Quyền lợi ==========
        event.setParticipationBenefits("Chứng nhận tham gia, áo thun sự kiện, cơ hội phỏng vấn thực tập tại VinAI/MoMo/Zalo.");

        List<Prize> prizes = new ArrayList<>();
        Prize firstPrize = new Prize();
        firstPrize.setPrizeName("Giải Nhất");
        firstPrize.setDescription("Tiền mặt + Cúp + Chứng nhận");
        firstPrize.setMoney(20000000);
        firstPrize.setQuantity(1);
        firstPrize.setPrizeType(PrizeType.MAIN);
        firstPrize.setEvent(event);
        prizes.add(firstPrize);

        Prize secondPrize = new Prize();
        secondPrize.setPrizeName("Giải Nhì");
        secondPrize.setDescription("Tiền mặt + Chứng nhận");
        secondPrize.setMoney(10000000);
        secondPrize.setQuantity(1);
        secondPrize.setPrizeType(PrizeType.MAIN);
        secondPrize.setEvent(event);
        prizes.add(secondPrize);

        Prize thirdPrize = new Prize();
        thirdPrize.setPrizeName("Giải Ba");
        thirdPrize.setDescription("Tiền mặt + Chứng nhận");
        thirdPrize.setMoney(5000000);
        thirdPrize.setQuantity(1);
        thirdPrize.setPrizeType(PrizeType.MAIN);
        thirdPrize.setEvent(event);
        prizes.add(thirdPrize);

        Prize potentialPrize = new Prize();
        potentialPrize.setPrizeName("Giải Tiềm Năng");
        potentialPrize.setDescription("Dành cho đội có ý tưởng sáng tạo nhất");
        potentialPrize.setMoney(2000000);
        potentialPrize.setQuantity(2);
        potentialPrize.setPrizeType(PrizeType.EXTENDED);
        potentialPrize.setEvent(event);
        prizes.add(potentialPrize);

        event.setPrizes(prizes);

        // ========== STEP 4: Vòng thi (Round + Timeline + SubmissionConfig) ==========
        List<Round> rounds = new ArrayList<>();

        // -- Vòng 1: Sơ loại --
        Round round1 = new Round();
        round1.setName("Vòng sơ loại");
        round1.setTimeStart(now.minusDays(1));
        round1.setTimeEnd(now.plusDays(22));
        round1.setHasPresetiontation(false);
        round1.setTopTeamPass(20);
        round1.setOrdinal_number(1);
        round1.setSubmissionDeadline(now.plusDays(22));
        round1.setMeetingLink("https://meet.google.com/seal-round1");
        round1.setPosition("https://meet.google.com/seal-round1");
        round1.setEvent(event);
        if (officialTemplate != null) {
            round1.setScoringTemplate(officialTemplate); // Gán template 1 cho Round 1
        }

        SubmissionConfig config1 = new SubmissionConfig(
                round1, "Vòng sơ loại", now.minusDays(1), now.plusDays(22),
                "Nộp file PDF ý tưởng (tối đa 5 trang) và link GitHub repo (nếu có).", true
        );
        round1.setSubmissionConfig(config1);

        List<RoundTimeline> timeline1 = new ArrayList<>();
        timeline1.add(new RoundTimeline(
                "Mở cổng nộp bài",
                "Thí sinh bắt đầu nộp ý tưởng",
                "08:00",
                "08:30",
                round1
        ));
        timeline1.add(new RoundTimeline(
                "Chấm điểm",
                "Ban giám khảo chấm bài",
                "13:00",
                "17:00",
                round1
        ));
        round1.setRoundTimelines(timeline1);
        rounds.add(round1);

        // -- Vòng 2: Bán kết --
        Round round2 = new Round();
        round2.setName("Vòng bán kết");
        round2.setTimeStart(now.plusDays(30));
        round2.setTimeEnd(now.plusDays(30).plusHours(6));
        round2.setHasPresetiontation(true);
        round2.setTopTeamPass(10);
        round2.setOrdinal_number(2);
        round2.setPosition("Hội trường A, Đại học FPT TP.HCM");
        round2.setEvent(event);
        if (officialTemplate != null) {
            round2.setScoringTemplate(officialTemplate); // Gán template 1 cho Round 2
        }
        rounds.add(round2);

        // -- Vòng 3: Chung kết --
        Round round3 = new Round();
        round3.setName("Vòng chung kết");
        round3.setTimeStart(now.plusDays(35));
        round3.setTimeEnd(now.plusDays(35).plusHours(8));
        round3.setHasPresetiontation(true);
        round3.setTopTeamPass(3);
        round3.setOrdinal_number(3);
        round3.setPosition("Hội trường lớn, Đại học FPT TP.HCM");
        round3.setEvent(event);
        if (officialTemplate != null) {
            round3.setScoringTemplate(officialTemplate); // Gán template 1 cho Round 3
        }
        rounds.add(round3);

        event.setRounds(rounds);

        // ========== STEP 5: Bảng đấu (Track) ==========
        List<Track> tracks = new ArrayList<>();

        Track trackAI = new Track();
        trackAI.setName("AI/Machine Learning");
        trackAI.setDes("Giải pháp ứng dụng AI/ML để giải quyết vấn đề xã hội.");
        trackAI.setMinTeamPerTrack(1);
        trackAI.setMaxTeamPerTrack(15);
        trackAI.setEvent(event);
        tracks.add(trackAI);

        Track trackBlockchain = new Track();
        trackBlockchain.setName("Blockchain");
        trackBlockchain.setDes("Ứng dụng blockchain trong minh bạch hoá dữ liệu cộng đồng.");
        trackBlockchain.setMinTeamPerTrack(1);
        trackBlockchain.setMaxTeamPerTrack(10);
        trackBlockchain.setEvent(event);
        tracks.add(trackBlockchain);

        Track trackMobile = new Track();
        trackMobile.setName("Mobile App");
        trackMobile.setDes("Ứng dụng di động phục vụ đời sống hàng ngày.");
        trackMobile.setMinTeamPerTrack(1);
        trackMobile.setMaxTeamPerTrack(10);
        trackMobile.setEvent(event);
        tracks.add(trackMobile);

        event.setTracks(tracks);

        // ========== STEP 6: Mốc thời gian (Milestone) ==========
        List<Milestone> milestones = new ArrayList<>();
        milestones.add(new Milestone("Mở cổng đăng ký", event.getOpenRegisterTime(), null, "Hệ thống tự động", event));
        milestones.add(new Milestone("Đóng đăng ký", event.getCloseRegisterTime(), null, "Hệ thống tự động", event));
        milestones.add(new Milestone(round1.getName(), round1.getTimeStart(), round1.getTimeEnd(), round1.getPosition(), event));
        milestones.add(new Milestone(round2.getName(), round2.getTimeStart(), round2.getTimeEnd(), round2.getPosition(), event));
        milestones.add(new Milestone(round3.getName(), round3.getTimeStart(), round3.getTimeEnd(), round3.getPosition(), event));
        milestones.add(new Milestone("Công bố kết quả chung cuộc", now.plusDays(36), null, "Công bố online trên fanpage", event));
        event.setMilestones(milestones);

        // ========== Lưu Event và Cascade ==========
        Event savedEvent = eventRepository.save(event);

        // ========== STEP 7: Mời Mentor / Giám khảo ==========
        initMentorJudgeInvites(savedEvent);

        // ========== STEP 8: Khởi tạo 1 Team mẫu gồm 5 User có sẵn ==========
        if (user1 != null && user2 != null && user3 != null && user4 != null && user5 != null) {
            Track selectedTrack = savedEvent.getTracks().get(0); // Bảng đấu AI/Machine Learning

            Team customTeam = new Team();
            customTeam.setName("SEAL INNOVATORS");
            customTeam.setDescription("Đội thi tập trung phát triển giải pháp toàn diện kết hợp giữa UI/UX tối ưu và hệ thống backend mạnh mẽ.");
            customTeam.setStatus(TeamStatus.APPROVED);
            customTeam.setCreateAt(LocalDate.now());
            customTeam.setInviteCode("SEAL-INV-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
            customTeam.setLeader(user1); // Chọn Bùi Thiên Khánh làm Leader
            customTeam.setTrack(selectedTrack);

            customTeam = teamRepository.save(customTeam);

            // Gộp thành viên chính thức
            List<Member> teamMembers = new ArrayList<>();
            Member m1 = new Member(MemberRole.LEADER, MemberStatus.OFFICAL, customTeam, user1, JoinMethod.CREATETEAM);
            Member m2 = new Member(MemberRole.MEMBER, MemberStatus.OFFICAL, customTeam, user2, JoinMethod.JOINBYCODE);
            Member m3 = new Member(MemberRole.MEMBER, MemberStatus.OFFICAL, customTeam, user3, JoinMethod.JOINBYCODE);
            Member m4 = new Member(MemberRole.MEMBER, MemberStatus.OFFICAL, customTeam, user4, JoinMethod.JOINBYCODE);
            Member m5 = new Member(MemberRole.MEMBER, MemberStatus.OFFICAL, customTeam, user5, JoinMethod.JOINBYCODE);

            teamMembers.add(m1);
            teamMembers.add(m2);
            teamMembers.add(m3);
            teamMembers.add(m4);
            teamMembers.add(m5);

            customTeam.setMembers(teamMembers);

            memberRepository.save(m1);
            memberRepository.save(m2);
            memberRepository.save(m3);
            memberRepository.save(m4);
            memberRepository.save(m5);

            teamRepository.save(customTeam);
            System.out.println("✅ Khởi tạo thành công 1 Đội thi mẫu: SEAL INNOVATORS (5 thành viên)!");
        }
    }

    private void initMentorJudgeInvites(Event event) {
        Track trackAI = event.getTracks().get(0);
        Track trackBlockchain = event.getTracks().get(1);
        Track trackMobile = event.getTracks().get(2);

        Round round1 = event.getRounds().get(0);
        Round round2 = event.getRounds().get(1);
        Round round3 = event.getRounds().get(2);

        User sender = userRepository.findByEmail("admin@gmail.com").orElse(null);

        // ==================== 1. PHÂN CÔNG MENTOR (THEO TRACK) ====================
        inviteMentor(sender, event, "le.minh.tri@uit.edu.vn", trackAI.getId());
        inviteMentor(sender, event, "pham.thi.lan@vinai.io", trackAI.getId());

        inviteMentor(sender, event, "nguyen.van.a@fpt.edu.vn", trackBlockchain.getId());
        inviteMentor(sender, event, "vũ.hoang.c@fpt.edu.vn", trackBlockchain.getId());

        inviteMentor(sender, event, "tran.thi.b@fpt.edu.vn", trackMobile.getId());

        // ==================== 2. PHÂN CÔNG JUDGE (CẶP TRACK + ROUND) ====================
        // --- BẢNG AI/MACHINE LEARNING (Round 1, 2, 3) ---
        inviteJudge(sender, event, "hoang.van.minh@hcmut.edu.vn", List.of(
                new JudgeAssignment(trackAI.getId(), round1.getId()),
                new JudgeAssignment(trackAI.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "tran.quoc.bao@momo.vn", List.of(
                new JudgeAssignment(trackAI.getId(), round3.getId())
        ));

        // --- BẢNG BLOCKCHAIN (Round 1, 2, 3) ---
        inviteJudge(sender, event, "nguyen.thi.hong@zalo.me", List.of(
                new JudgeAssignment(trackBlockchain.getId(), round1.getId()),
                new JudgeAssignment(trackBlockchain.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "dang.le.d@fpt.edu.vn", List.of(
                new JudgeAssignment(trackBlockchain.getId(), round3.getId())
        ));

        // --- BẢNG MOBILE APP (Round 1, 2, 3) ---
        inviteJudge(sender, event, "tran.quoc.bao@momo.vn", List.of(
                new JudgeAssignment(trackMobile.getId(), round1.getId()),
                new JudgeAssignment(trackMobile.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "hoang.van.minh@hcmut.edu.vn", List.of(
                new JudgeAssignment(trackMobile.getId(), round3.getId())
        ));

        // === TEST CASE CHẶN THỬ NGHIỆM TỰ ĐỘNG ===
        inviteJudge(sender, event, "nguyen.van.a@fpt.edu.vn", List.of(
                new JudgeAssignment(trackBlockchain.getId(), round1.getId())
        ));
    }

    private void inviteMentor(User sender, Event event, String mentorEmail, long trackId) {
        User mentor = userRepository.findByEmail(mentorEmail).orElse(null);
        if (mentor == null) return;

        SystemRequest req = new SystemRequest();
        req.setSender(sender);
        req.setReceiver(mentor);
        req.setReferenceId(event.getId());
        req.setTrackId(trackId);
        req.setReferenceType(SystemRequest.ReferenceType.EVENT);
        req.setType(SystemRequest.RequestType.MENTOR_INVITE);
        req.setStatus(SystemRequest.RequestStatus.PENDING);
        req.setMessage("Mời bạn tham gia làm mentor cho sự kiện " + event.getName());
        req.setSentAt(LocalDateTime.now());
        systemRequestRepository.save(req);

        mentorTrackMapping.computeIfAbsent(mentorEmail, k -> new HashSet<>()).add(trackId);
    }

    private void inviteJudge(User sender, Event event, String judgeEmail, List<JudgeAssignment> assignments) {
        User judge = userRepository.findByEmail(judgeEmail).orElse(null);
        if (judge == null) return;

        for (JudgeAssignment assignment : assignments) {
            if (mentorTrackMapping.containsKey(judgeEmail) &&
                    mentorTrackMapping.get(judgeEmail).contains(assignment.trackId())) {
                System.out.println("⚠️ [VALIDATION FAILED] " + judgeEmail + " đã là Mentor cho Track ID "
                        + assignment.trackId() + ". Không được phép mời làm Judge cho Track này!");
                continue;
            }

            SystemRequest req = new SystemRequest();
            req.setSender(sender);
            req.setReceiver(judge);
            req.setReferenceId(event.getId());
            req.setTrackId(assignment.trackId());
            req.setRoundId(assignment.roundId());
            req.setReferenceType(SystemRequest.ReferenceType.EVENT);
            req.setType(SystemRequest.RequestType.JUDGE_INVITE);
            req.setStatus(SystemRequest.RequestStatus.PENDING);
            req.setMessage("Mời bạn tham gia làm giám khảo cho sự kiện " + event.getName());
            req.setSentAt(LocalDateTime.now());

            systemRequestRepository.save(req);
        }
    }

    // ==================== 3. KHỞI TẠO BIỂU MẪU CHẤM ĐIỂM (SCORING TEMPLATES) ====================
    private ScoringTemplate initSampleScoringTemplates() {
        LocalDateTime timeNow = LocalDateTime.now();

        // --- Mẫu 1: Bản chính thức (OFFICIAL) ---
        ScoringTemplate officialTemplate = new ScoringTemplate();
        officialTemplate.setName("Khung Đánh Giá Hackathon Chung Cuộc");
        officialTemplate.setDescription("Bảng tiêu chí chuẩn dùng để đánh giá toàn diện sản phẩm công nghệ vòng chung kết.");
        officialTemplate.setCreateAt(timeNow);
        officialTemplate.setUpdateAt(timeNow);
        officialTemplate.setTieBreaking(true);
        officialTemplate.setStandardDeviation(1.5);
        officialTemplate.setStatus(ScoringTemplateStatus.OFFICIAL);
        officialTemplate.setUsageCount(3);

        Criterion crit1 = new Criterion();
        crit1.setName("Tính Sáng Tạo & Đột Phá");
        crit1.setDescription("Ý tưởng có mới lạ, độc đáo và giải quyết triệt để nỗi đau của thị trường không?");
        crit1.setWeight(30);
        crit1.setMaxRange(10);
        officialTemplate.addCriterion(crit1);

        Criterion crit2 = new Criterion();
        crit2.setName("Kiến Trúc & Hoàn Thiện Kỹ Thuật");
        crit2.setDescription("Mức độ hoàn thiện của mã nguồn, độ ổn định của bản demo sản phẩm thực tế.");
        crit2.setWeight(40);
        crit2.setMaxRange(10);
        officialTemplate.addCriterion(crit2);

        Criterion crit3 = new Criterion();
        crit3.setName("Kỹ Năng Thuyết Trình (Pitching)");
        crit3.setDescription("Khả năng trình bày mạch lạc, trả lời câu hỏi phản biện từ Hội đồng Giám khảo.");
        crit3.setWeight(30);
        crit3.setMaxRange(10);

        officialTemplate.addCriterion(crit3);

        officialTemplate = templateRepository.save(officialTemplate);

        // --- Mẫu 2: Bản Lưu Nháp (DRAFT) ---
        ScoringTemplate draftTemplate = new ScoringTemplate();
        draftTemplate.setName("Tiêu chí Sơ loại Ý tưởng (Nháp)");
        draftTemplate.setDescription("Khung đánh giá nhanh file Pitch Deck sơ bộ của các đội thi gửi về hệ thống.");
        draftTemplate.setCreateAt(timeNow);
        draftTemplate.setUpdateAt(timeNow);
        draftTemplate.setTieBreaking(false);
        draftTemplate.setStandardDeviation(2.0);
        draftTemplate.setStatus(ScoringTemplateStatus.DRAFT);
        draftTemplate.setUsageCount(0);

        Criterion draftCrit1 = new Criterion();
        draftCrit1.setName("Mức độ phù hợp chủ đề");
        draftCrit1.setDescription("Giải pháp đưa ra có bám sát bài toán cộng đồng mà Hackathon đề ra không?");
        draftCrit1.setWeight(50);
        draftTemplate.addCriterion(draftCrit1);

        Criterion draftCrit2 = new Criterion();
        draftCrit2.setName("Tính khả thi thực tế");
        draftCrit2.setDescription("Mô hình kinh doanh hoặc mô hình triển khai có khả năng áp dụng thật hay không?");
        draftCrit2.setWeight(50);
        draftTemplate.addCriterion(draftCrit2);

        templateRepository.save(draftTemplate);

        System.out.println("✅ Khởi tạo thành công 2 bộ Scoring Template mẫu!");

        return officialTemplate;
    }
}