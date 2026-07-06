package com.minhtung.hackathon.config;

import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.*;
import com.minhtung.hackathon.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final TeamRepository teamRepository;
    private final StudentprofileRepository studentprofileRepository;
    private final EventRepository eventRepository;
    private final SystemRequestRepository systemRequestRepository;
    private final ScoringTemplateRepository templateRepository;

    // Bộ nhớ tạm lưu trữ: Email của Mentor -> Tập hợp các TrackId được giao làm Mentor
    private final Map<String, Set<Long>> mentorTrackMapping = new HashMap<>();

    // Class cấu trúc nhỏ dùng để map cặp Track và Round cho Judge
    private record JudgeAssignment(Long trackId, Long roundId) {
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // ==================== TÀI KHOẢN LECTURER (MENTOR & JUDGE) ====================
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
            u8.setOrg("MoMo");
            u8.setRole(Role.LECTURER);
            u8.setActive(true);
            u8.setStatus(UserStatus.ACCEPTED);

            // ---- THÊM MỚI 4 TÀI KHOẢN LECTURER ĐỂ PHỦ KÍN TẤT CẢ TRACK & ROUND ----
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

            // ==================== THÀNH VIÊN VÀ SINH VIÊN ====================
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

            // HARD CODE PROFILE USER 1 - 3
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

            // ---------------- team 1 đã đủ maxSlot -----------------------
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
            teamService.joinTeamByCode(teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user7.getId());
            teamService.joinTeamByCode(teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user8.getId());
            teamService.joinTeamByCode(teamRepository.findByLeaderId(user6.getId()).get().getInviteCode(), user9.getId());

            // ------ team 2 đang có 2 thành viên -------
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
            teamService.joinTeamByCode(teamRepository.findByLeaderId(user10.getId()).get().getInviteCode(), user11.getId());

            User user12 = new User();
            user12.setFullName("ADMIN");
            user12.setEmail("admin@gmail.com");
            user12.setPassword("123456");
            user12.setRole(Role.ADMIN);
            user12.setActive(true);
            user12.setStatus(UserStatus.ACCEPTED);
            userRepository.save(user12);
        }

        if (eventRepository.count() == 0) {
            initSampleEvent();
        }

        if (templateRepository.count() == 0) {
            initSampleScoringTemplates();
        }
    }

    private void initSampleEvent() {
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
        event.setStatus(EventStatus.PUBLISHED);
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
        round1.setTimeStart(now.plusDays(21));
        round1.setTimeEnd(now.plusDays(22));
        round1.setHasPresetiontation(false);
        round1.setTopTeamPass(20);
        round1.setOrdinal_number(1);
        round1.setSubmissionDeadline(now.plusDays(22));
        round1.setMeetingLink("https://meet.google.com/seal-round1");
        round1.setPosition("https://meet.google.com/seal-round1");
        round1.setEvent(event);

        SubmissionConfig config1 = new SubmissionConfig(
                round1, "Vòng sơ loại", now.plusDays(21), now.plusDays(22),
                "Nộp file PDF ý tưởng (tối đa 5 trang) và link GitHub repo (nếu có).", true
        );
        round1.setSubmissionConfig(config1);

        List<RoundTimeline> timeline1 = new ArrayList<>();
        timeline1.add(new RoundTimeline("Mở cổng nộp bài", "Thí sinh bắt đầu nộp ý tưởng", now.plusDays(21).toString(), null, round1));
        timeline1.add(new RoundTimeline("Chấm điểm", "Ban giám khảo chấm bài", now.plusDays(22).toString(), null, round1));
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
    }

    private void initMentorJudgeInvites(Event event) {
        Track trackAI = event.getTracks().get(0);
        Track trackBlockchain = event.getTracks().get(1);
        Track trackMobile = event.getTracks().get(2);

        Round round1 = event.getRounds().get(0); // Vòng sơ loại
        Round round2 = event.getRounds().get(1); // Vòng bán kết
        Round round3 = event.getRounds().get(2); // Vòng chung kết

        User sender = userRepository.findByEmail("admin@gmail.com").orElse(null);

        // ==================== 1. PHÂN CÔNG MENTOR (THEO TRACK) ====================
        // Đảm bảo cả 3 track đều có Mentor đứng ra hỗ trợ
        inviteMentor(sender, event, "le.minh.tri@uit.edu.vn", trackAI.getId());
        inviteMentor(sender, event, "pham.thi.lan@vinai.io", trackAI.getId());

        inviteMentor(sender, event, "nguyen.van.a@fpt.edu.vn", trackBlockchain.getId());
        inviteMentor(sender, event, "vũ.hoang.c@fpt.edu.vn", trackBlockchain.getId());

        inviteMentor(sender, event, "tran.thi.b@fpt.edu.vn", trackMobile.getId());

        // ==================== 2. PHÂN CÔNG JUDGE (CẶP TRACK + ROUND) ====================
        // Mục tiêu: Phủ kín tất cả các Round (1, 2, 3) cho tất cả các Track (AI, Blockchain, Mobile)
        // Lưu ý: Không phân công Judge trùng vào Track mà người đó đang Mentor.

        // --- BẢNG AI/MACHINE LEARNING (Round 1, 2, 3) ---
        // PGS. Hoàng Văn Minh & TS. Trần Quốc Bảo không làm mentor AI -> Chấm AI thoải mái
        inviteJudge(sender, event, "hoang.van.minh@hcmut.edu.vn", List.of(
                new JudgeAssignment(trackAI.getId(), round1.getId()),
                new JudgeAssignment(trackAI.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "tran.quoc.bao@momo.vn", List.of(
                new JudgeAssignment(trackAI.getId(), round3.getId())
        ));

        // --- BẢNG BLOCKCHAIN (Round 1, 2, 3) ---
        // ThS. Nguyễn Thị Hồng & TS. Đặng Lê D không mentor Blockchain -> Cho chấm Blockchain
        inviteJudge(sender, event, "nguyen.thi.hong@zalo.me", List.of(
                new JudgeAssignment(trackBlockchain.getId(), round1.getId()),
                new JudgeAssignment(trackBlockchain.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "dang.le.d@fpt.edu.vn", List.of(
                new JudgeAssignment(trackBlockchain.getId(), round3.getId())
        ));

        // --- BẢNG MOBILE APP (Round 1, 2, 3) ---
        // TS. Trần Quốc Bảo & PGS. Hoàng Văn Minh không mentor Mobile -> Cho chấm Mobile
        inviteJudge(sender, event, "tran.quoc.bao@momo.vn", List.of(
                new JudgeAssignment(trackMobile.getId(), round1.getId()),
                new JudgeAssignment(trackMobile.getId(), round2.getId())
        ));
        inviteJudge(sender, event, "hoang.van.minh@hcmut.edu.vn", List.of(
                new JudgeAssignment(trackMobile.getId(), round3.getId())
        ));


        // === TEST CASE CHẶN THỬ NGHIỆM TỰ ĐỘNG ===
        // Thử mời TS. Nguyễn Văn A chấm bảng Blockchain Vòng 1.
        // Vì thầy A đã Mentor cho bảng Blockchain ở trên nên hệ thống sẽ tự động in log CẢNH BÁO và CHẶN LẠI!
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

        // Ghi nhận vào Map: Mentor này đang quản lý Track này
        mentorTrackMapping.computeIfAbsent(mentorEmail, k -> new HashSet<>()).add(trackId);
    }

    private void inviteJudge(User sender, Event event, String judgeEmail, List<JudgeAssignment> assignments) {
        User judge = userRepository.findByEmail(judgeEmail).orElse(null);
        if (judge == null) return;

        for (JudgeAssignment assignment : assignments) {
            // KIỂM TRA ĐIỀU KIỆN CHẶN: Nếu người này đã làm Mentor cho chính Track này rồi
            if (mentorTrackMapping.containsKey(judgeEmail) &&
                    mentorTrackMapping.get(judgeEmail).contains(assignment.trackId())) {
                System.out.println("⚠️ [VALIDATION FAILED] " + judgeEmail + " đã là Mentor cho Track ID "
                        + assignment.trackId() + ". Không được phép mời làm Judge cho Track này!");
                continue; // Bỏ qua cặp assign lỗi này và nhảy sang vòng lặp kế tiếp
            }

            SystemRequest req = new SystemRequest();
            req.setSender(sender);
            req.setReceiver(judge);
            req.setReferenceId(event.getId());

            // Lưu đồng thời cả Track ID và Round ID vào lời mời
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
    private void initSampleScoringTemplates() {
        LocalDateTime timeNow = LocalDateTime.now();

        // --- Mẫu 1: Bản chính thức (ACTIVE / PUBLISHED) ---
        ScoringTemplate officialTemplate = new ScoringTemplate();
        officialTemplate.setName("Khung Đánh Giá Hackathon Chung Cuộc");
        officialTemplate.setDescription("Bảng tiêu chí chuẩn dùng để đánh giá toàn diện sản phẩm công nghệ vòng chung kết.");
        officialTemplate.setCreateAt(timeNow);
        officialTemplate.setUpdateAt(timeNow);
        officialTemplate.setTieBreaking(true); // Ưu tiên giải quyết khi đồng điểm
        officialTemplate.setStandardDeviation(1.5); // Ngưỡng độ lệch chuẩn tối đa cho phép giữa các giám khảo

        // Lưu ý: Thay thế ScoringTemplateStatus.ACTIVE/PUBLISHED đúng theo tên Enum gốc của bạn nhé
        officialTemplate.setStatus(ScoringTemplateStatus.OFFICIAL);
        officialTemplate.setUsageCount(3); // Giả lập đã được dùng 3 lần

        // Gán các tiêu chí con (Criterion) sử dụng phương thức helper addCriterion sẵn có
        Criterion crit1 = new Criterion();
        crit1.setName("Tính Sáng Tạo & Đột Phá");
        crit1.setDescription("Ý tưởng có mới lạ, độc đáo và giải quyết triệt để nỗi đau của thị trường không?");
        crit1.setWeight(30);
        officialTemplate.addCriterion(crit1);

        Criterion crit2 = new Criterion();
        crit2.setName("Kiến Trúc & Hoàn Thiện Kỹ Thuật");
        crit2.setDescription("Mức độ hoàn thiện của mã nguồn, độ ổn định của bản demo sản phẩm thực tế.");
        crit2.setWeight(40);
        officialTemplate.addCriterion(crit2);

        Criterion crit3 = new Criterion();
        crit3.setName("Kỹ Năng Thuyết Trình (Pitching)");
        crit3.setDescription("Khả năng trình bày mạch lạc, trả lời câu hỏi phản biện từ Hội đồng Giám khảo.");
        crit3.setWeight(30);
        officialTemplate.addCriterion(crit3);

        templateRepository.save(officialTemplate);


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
    }

}