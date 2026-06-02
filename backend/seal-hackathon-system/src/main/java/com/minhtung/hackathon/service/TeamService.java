package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.request.InvitationRequest;
import com.minhtung.hackathon.dto.response.CreateTeamResponse;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.TeamRequest;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.MemberRole;
import com.minhtung.hackathon.enums.RequestStatus;
import com.minhtung.hackathon.enums.RequestType;
import com.minhtung.hackathon.enums.TeamStatus;
import com.minhtung.hackathon.repository.MemberRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.TeamRequestRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.InvalidParameterException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;


    //tao 1 team moi

    @Transactional
    public CreateTeamResponse createTeam(CreateTeamDto create, long leaderId) {
        User leader = userRepository.findById(leaderId).orElse(null);
        if (leader == null) {
            throw new IllegalArgumentException("nguoi tao team ko ton tai");
        }
        if (create.getName() == null || create.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đội không được để trống");
        }
        if (create.getDescription().length() > 30) {
            throw new IllegalArgumentException("tên đội không thể lớn hơn 30 kí tự ");
        }

        if (memberRepository.existsByMemberIDAndStatus(leaderId, true)) {
            throw new IllegalArgumentException("Bạn thuộc team rồi nên không thể tham gia đăng kí vào team khác");
        }
        List<String> userEmails = create.getInviteEmails();
        for (String email : userEmails) {
            User member = userRepository.findByEmail(email).orElse(null);
            if (member == null || member.getEmail().equals(leader.getEmail())) {
                throw new IllegalArgumentException("email bạn mời không tồn tại");
            }
        }
        String inviteCode = generateUniqueInviteCode();
        Team team = new Team(create.getName().trim(), leaderId, inviteCode, create.getDescription());
        team.setStatus(TeamStatus.OPEN);
        teamRepository.save(team);

        memberRepository.save(new Member(MemberRole.LEADER, true, team.getId(), leaderId, leader.getSchoolName(), leader.getFullName(), leader.getEmail()));


        List<String> emails = create.getInviteEmails();
        if (emails != null) {

            for (String email : emails) {
                if (email == null || email.trim().isEmpty()) {
                    continue;
                }

                // lay user duoc moi neu khong thi tra ve message
                User invitedUsers = userRepository.findByEmail(email.trim()).orElse(null);


                //luu teamRequest loai invitation(nguoi duoc moi can bam dong y de duoc tham gia vao team
                TeamRequest invitenation = new TeamRequest(leaderId, invitedUsers.getId(), team.getId(), RequestType.INVITATION, "Ban Duoc" + leader.getFullName() + "Moi vao team " + team.getName());
                teamRequestRepository.save(invitenation);
            }
        }
        int memberCount = memberRepository.countByTeamIdAndStatus((int) team.getId(), true);
        return toDto(team, memberCount);

    }

    //2. day la ham tham gia doi bang loi moi
    //luat la chi doi dang co Open moi co the join bang ma
    // tu dong them member ma khong can admin duyet
    @Transactional
    public String joinTeamByCode(String inviteCode, long userId) {
        Team team = teamRepository.findByInviteCode(inviteCode).orElseThrow(() -> new IllegalArgumentException("Mã mời không hợp lệ hoặc không tồn tại"));


        // nhung team nao open thi moi tham gia vao
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("Đội hiện tại đã đóng, không thể tiếp nhận thành viên mới");
        }

        //kiem tra xem ban co thuoc team nao chua
        if (memberRepository.existsByTeamIdAndMemberIDAndStatus(team.getId(), userId, true)) {
            ;
            throw new IllegalArgumentException("Bạn đã là thành viên của đội " + team.getName() + " rồi!");
        }
        //yeu cau roi doi truoc khi muon tham gia
        if (memberRepository.existsByMemberIDAndStatus(userId, true)) {
            throw new IllegalArgumentException("Bạn đang tham gia một đội khác. Vui lòng rời đội cũ trước khi muốn gia nhập đội mới!");
        }

        int currentCount = memberRepository.countByTeamIdAndStatus(team.getId(), true);
        if (currentCount >= 4) {
            throw new IllegalArgumentException("Đội " + team.getName() + " đã đủ tối đa 4 thành viên rồi!");
        }
        User user = userRepository.findById(userId).orElseThrow();

        memberRepository.save(new Member(MemberRole.MEMBER, true, team.getId(), userId, user.getSchoolName(), user.getFullName(), user.getEmail()));
        //sau khi tham gia doi thanh cong chuyen het nhung request ve rejected
        List<TeamRequest> teamRequests = teamRequestRepository.findBySenderIdOrReceiverId(userId, userId);
        for (TeamRequest teamRequest : teamRequests) {
            teamRequest.setStatus(RequestStatus.REJECTED);
        }

        return "tham gia đội " + team.getName() + " thành công";

    }

    //ham nay de kiem xem doi nao damg tuyen thanh vien(chi doi dang o trang thai open moi duoc xuát hien
    public List<CreateTeamResponse> searchTeam(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return new ArrayList<>();
        }
        List<Team> teams = teamRepository.findByNameContainingIgnoreCaseAndStatus(keyword.trim(), TeamStatus.OPEN);
        List<CreateTeamResponse> result = new ArrayList<>();
        for (Team team : teams) {
            int count = memberRepository.countByTeamIdAndStatus(team.getId(), true);
            CreateTeamResponse dto = toDto(team, count);
            dto.setInviteCode(null);//de an ma moi khi earch cong khai

            result.add(dto);
        }
        return result;
    }


    //ham nay de gui join request
    // dieu kien nhung team dang o trang thai open moi co
    //can leader duyet nưa nha

    @Transactional
    public String sendJoinRequest(JoinTeamRequest joinTeamRequest, long userId) {
        Team team = teamRepository.findById(joinTeamRequest.getTeamId()).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("không tim thấy đội ");
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("đội nay không còn nhận thành viên nữa");
        }
        if (memberRepository.existsByTeamIdAndMemberIDAndStatus(joinTeamRequest.getTeamId(), userId, true)) {
            ;
            throw new IllegalArgumentException("ban da o trong doi khac roi");
        }
        if (memberRepository.countByTeamIdAndStatus(joinTeamRequest.getTeamId(), true) >= 4) {
            throw new IllegalArgumentException("doi nay da du so luong thanh vien la 4");
        }
        //khuc nay la do leader duyet
        if (teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(userId, joinTeamRequest.getTeamId(), RequestType.JOIN_REQUEST, RequestStatus.PENDING)) {
            return " bạn đã  yêu cầu vui lòng đợi leader duyệt";
        }
        teamRequestRepository.save(new TeamRequest(userId, team.getLeaderID(), joinTeamRequest.getTeamId(), RequestType.JOIN_REQUEST, joinTeamRequest.getMessage()));
        return "đã gửi yêu cầu tham gia đội đến team " + team.getName() + " thành công";
    }

    //ham nay leader xem nhung join team request

    public List<JoinTeamResponse> viewJoinTeamRequest(long userId) {
        Member leader = memberRepository.findByMemberID(userId).orElseThrow();
        if (leader == null || leader.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không phải leader");
        }
        List<TeamRequest> joinTeamRequests = teamRequestRepository.findByTypeAndStatusAndReceiverId(RequestType.JOIN_REQUEST, RequestStatus.PENDING, userId);

        List<JoinTeamResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : joinTeamRequests) {
            JoinTeamResponse joinTeamResponse = new JoinTeamResponse();
            joinTeamResponse.setId(teamRequest.getId());
            joinTeamResponse.setName(userRepository.findById(teamRequest.getSenderId()).get().getFullName());
            joinTeamResponse.setEmail(userRepository.findById(teamRequest.getSenderId()).get().getEmail());
            joinTeamResponse.setMessage(teamRequest.getMessage());
            responseList.add(joinTeamResponse);
        }
        return responseList;
    }

    //leader xem nhung invitation da gui di
    public List<LeaderInvitationResponse> leaderViewInvitation(long userId) {
        Member leader = memberRepository.findByMemberID(userId).orElseThrow();
        if (leader.getRole() != MemberRole.LEADER ) {
            throw new IllegalArgumentException("Bạn không phải leader");
        }
        List<TeamRequest> teamRequests = teamRequestRepository.findByTypeAndStatusAndSenderId(RequestType.INVITATION, RequestStatus.PENDING, userId);
        List<LeaderInvitationResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : teamRequests) {
            LeaderInvitationResponse leaderInvitationResponse = new LeaderInvitationResponse();
            User user = userRepository.findById(teamRequest.getReceiverId()).orElse(null);
            if (user == null) {
                continue;
            }
            leaderInvitationResponse.setId(user.getId());
            leaderInvitationResponse.setName(user.getFullName());
            leaderInvitationResponse.setEmail(user.getEmail());
            responseList.add(leaderInvitationResponse);
        }
        return responseList;
    }


    //noteam member view nhung invitation duoc gui toi minh
    //chuc nang cua no team member
    public List<MemberInvitationResponse> memberViewInvitation(long userId) {

        List<TeamRequest> teamRequests = teamRequestRepository.findByTypeAndStatusAndReceiverId(RequestType.INVITATION, RequestStatus.PENDING, userId);
        List<MemberInvitationResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : teamRequests) {
            MemberInvitationResponse memberInvitationResponse = new MemberInvitationResponse();
            memberInvitationResponse.setId(teamRequest.getId());
            memberInvitationResponse.setTeamName(teamRepository.findById(teamRequest.getTeamId()).orElse(null).getName());
            memberInvitationResponse.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeamId(), true));
            memberInvitationResponse.setMaxSlots(4);
            memberInvitationResponse.setMessage(teamRequest.getMessage());
            responseList.add(memberInvitationResponse);
        }
        return responseList;
    }

    //sinh vien xem nhung request da gui di
    public List<MemberRequestResponse> memberViewRequest(long userId) {
        List<TeamRequest> teamRequests = teamRequestRepository.findByTypeAndStatusAndSenderId(RequestType.JOIN_REQUEST, RequestStatus.PENDING, userId);
        List<MemberRequestResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : teamRequests) {
            MemberRequestResponse res = new MemberRequestResponse();
            res.setId(teamRequest.getId());
            res.setTeamName(teamRepository.findById(teamRequest.getTeamId()).orElse(null).getName());
            res.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeamId(), true));
            res.setMaxSlots(4);
            responseList.add(res);
        }
        return responseList;
    }

    //leader xoa nhung invitation da gui
    public String deleteInvitation(long requestId, long leaderId) {
        Team team = teamRepository.findByLeaderID(leaderId).orElse(null);
        if (team == null) {
            return "Team Khong Ton Tai";
        }
        Member leader = memberRepository.findByMemberID(leaderId).orElse(null);
        if (leader == null || leader.getRole() != MemberRole.LEADER) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }
        TeamRequest teamRequest = teamRequestRepository.findById(requestId).orElse(null);
        if(teamRequest == null){
            return "loi roi";
        }
        if ( teamRequest.getStatus() != RequestStatus.PENDING ) {
            return "request da duoc xu ly hoac ko ton tai";
        }
        teamRequestRepository.delete(teamRequest);
        return "xoa thanh cong invitation!";

    }

    //sinh vien xoa nhung request da gui
    public String deleteRequest(long requestId) {
        TeamRequest teamRequest = teamRequestRepository.findById(requestId).orElse(null);
        if (teamRequest.getStatus() != RequestStatus.PENDING || teamRequest == null) {
            return "request da duoc xu ly hoac ko ton tai";
        }
        teamRequestRepository.delete(teamRequest);
        return "xoa thanh cong request!";

    }

    //sinh vien xoa nhung request den team by team id
    public String deleteRequestByTeamId(long teamId, long userId) {
        TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamId(teamId, userId);
        if (teamRequest == null) {
            throw new InvalidParameterException("Team Khong Ton Tai");
        }
        if (teamRequest.getStatus() != RequestStatus.PENDING || teamRequest == null) {
            return "request da duoc xu ly hoac ko ton tai";
        }
        teamRequestRepository.delete(teamRequest);
        return "xoa thanh cong request!";

    }


    //User dong ý / từ chối lời mời (invation)
    //nguoi duoc moi co the tu xu ly

    @Transactional
    public String respondToInvitation(Long requestId, boolean acp, long userId) {
        TeamRequest req = teamRequestRepository.findById(requestId).orElse(null);
        if (req == null) {
            return "Không tìm thấy lời mời";
        }
        if (!req.getReceiverId().equals(userId)) {
            return "ban không phải người nhận lời mời";
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            return "loi moi da duoc xu ly roi";

        }
        if (acp) {
            Team team = teamRepository.findById(req.getTeamId()).orElse(null);
            if (team == null || team.getStatus() != TeamStatus.OPEN) {
                req.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(req);
            }
            if (memberRepository.countByTeamIdAndStatus(team.getId(), true) >= 4) {
                req.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(req);
                return "doi cua bạn da du va khong con nhan thanh vien nua";
            }
            if (memberRepository.existsByMemberIDAndStatus(userId, true)) {
                return "ban thuoc team khac roi can out de vao nhom khac";
            }
            User user = userRepository.findById(userId).orElseThrow();

            memberRepository.save(new Member(MemberRole.MEMBER, true, req.getTeamId(), userId, user.getSchoolName(), user.getFullName(), user.getEmail()));
            req.setStatus(RequestStatus.APPROVED);
        } else {
            req.setStatus(RequestStatus.REJECTED);
        }
        teamRequestRepository.save(req);
        return acp ? "Đã tham gia đội thành công!" : "Đã từ chối lời mời";
    }

    //Leader duyet / tu choi join request
    @Transactional
    public String respondToJoinRequest(long requestId, boolean acp, long leaderId) {
        TeamRequest teamRequest = teamRequestRepository.findById(requestId).orElse(null);
        if (teamRequest == null) {
            return "request khong ton tai";
        }

        if (teamRequest.getStatus() == RequestStatus.APPROVED
                || teamRequest.getStatus() == RequestStatus.REJECTED) {
            return "loi moi da duoc xu ly roi";
        }
        Member leader = memberRepository.findByMemberID(leaderId).orElse(null);
        if (leader.getRole() != MemberRole.LEADER || leader == null) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }

        User user = userRepository.findById(teamRequest.getSenderId()).orElseThrow();

        if (acp) {
            memberRepository.save(new Member(
                    MemberRole.MEMBER, true, teamRequest.getTeamId(),
                    user.getId(), user.getSchoolName(), user.getFullName(), user.getEmail()
            ));

            teamRequest.setStatus(RequestStatus.APPROVED);
            teamRequestRepository.save(teamRequest);

            List<TeamRequest> teamRequests = teamRequestRepository.findBySenderId(user.getId());
            for (TeamRequest tr : teamRequests) {
                if (tr.getStatus() == RequestStatus.PENDING) {
                    tr.setStatus(RequestStatus.REJECTED);
                }
            }
            teamRequestRepository.saveAll(teamRequests); // ✅

            return "Ban da chap nhan cho " + user.getFullName() + " vao team";
        }

        teamRequest.setStatus(RequestStatus.REJECTED);
        teamRequestRepository.save(teamRequest); // ✅
        return "Ban da Tu choi cho " + user.getFullName() + " vao team";
    }


    //thanh vien  gui leave_request xin roi doi
    //leader can duyet
    //leader khong the tu y roi doi (giai tán nhóm)
    @Transactional
    public String requestLeave(Long teamID, long userId) {
        Member member = memberRepository.findByTeamIdAndMemberID(teamID, userId).orElse(null);
        if (member == null || !member.isStatus()) {
            return "ban khong thuoc doi nay ";
        }
        if (member.getRole() == MemberRole.LEADER) {
            return "ban la leader nen khong the roi doi duoc ";
        }
        Team team = teamRepository.findById(teamID).orElse(null);
        if (team == null) {
            return "khong tim thay doi nay";
        }
        if (team.getStatus() == TeamStatus.APPROVED) {
            return "đội của bạn đã được duyệt rôi , không thể rời đội";
        }
        if (teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(userId, teamID, RequestType.LEAVE_REQUEST, RequestStatus.PENDING)) {

            return "bạn đã gửi yêu  cầu xin ròi nhóm , cần được admin duyệt ";
        }
        teamRequestRepository.save(new TeamRequest(userId, team.getLeaderID(), teamID, RequestType.LEAVE_REQUEST, "Thanh Vien " + userRepository.findById(userId).get().getFullName() + "Xin Roi khoi doi"));

        return "đã gửi yêu cầu rời đội , chờ leader duyệt ";

    }

    //8 day la ham dung de leadder duyet vuec leave_request trong team

    @Transactional
    public String respondToLeaveRequest(Long requestId, boolean acp, int leaderId) {
        TeamRequest req = teamRequestRepository.findById(requestId).orElse(null);
        Member leader = memberRepository.findByMemberID(leaderId).orElse(null);
        if (req == null) {
            return "không tìm thấy yêu câu rời đội";
        }
        if (req.getType() != RequestType.LEAVE_REQUEST) {
            return "đây không phải yêu cầu rời đội";
        }
        if (!req.getReceiverId().equals(leaderId)) {
            return "ban khong phai leader cua doi nay";
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            return "yeu cau nay da duoc xu ly roi";
        }

        if (leader.getRole() != MemberRole.LEADER || leader == null) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }

        if (acp) {
            Member member = memberRepository.findByTeamIdAndMemberID(req.getTeamId(), req.getSenderId()).orElse(null);
            if (member != null) {
                member.setStatus(false);//danh dau da duoc roi doi
                memberRepository.save(member);
            }
            req.setStatus(RequestStatus.APPROVED);
        } else {
            req.setStatus(RequestStatus.REJECTED);
        }
        teamRequestRepository.save(req);
        return acp ? "Đã cho phép thành viên rời đội" : "Đã từ chối yêu cầu rời đội";
    }


    // leader chot doi  gui sumbmission cho ban admin
    //team status open thanh pending -approval
    @Transactional
    public String submitTeamForApporal(int teamId, long leaderId) {
        Team team = teamRepository.findById(leaderId).orElse(null);
        if (team == null) {
            return "khong tim thay doi";
        }
        if (team.getLeaderID() != leaderId) {
            return "Chỉ Leader mới có quyền chốt đội";
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            return "doi phai o trang thai open thi moi choi duoc ";
        }

        int count = memberRepository.countByTeamIdAndStatus(teamId, true);
        if (count == 4) {
            return "đội phải đủ 4 người mới được submit";
        }

        boolean alreadySumbit = teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(leaderId, teamId, RequestType.TEAM_SUBMISSION, RequestStatus.PENDING);

        if (alreadySumbit) {
            return "doi dang cho admin duyet ";
        }
        ;
        team.setStatus(TeamStatus.APPROVED);
        teamRepository.save(team);


        teamRequestRepository.save(new TeamRequest((int) leaderId, 0, teamId, RequestType.TEAM_SUBMISSION, "Team " + team.getName() + "Yeu Cau duoc xac thuc"));

        return "da nop roi " + team.getName() + "dang cho admin duyet nha";
    }

    //Admin duyet / tu choi team submisson
    //co 2 truong hop 1 appoved(khoa doi ) da dc duyey
    //hop 1 rejected(can chinh sua doi ) chua duoc duyet
    @Transactional
    public String adminReviewTeam(long requestId, boolean approve) {
        TeamRequest req = teamRequestRepository.findById(requestId).orElse(null);
        if (req == null) {
            return "khong tim thay yeu cau ";
        }
        if (req.getType() != RequestType.TEAM_SUBMISSION) {
            return "day khong phai yeu cau phe duyet ";
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            return "yeu cau nay da duoc xu ly";
        }
        Team team = teamRepository.findById(req.getTeamId()).orElse(null);
        if (team == null) {
            return "khong tim thay doi";

        }
        if (approve) {
            team.setStatus(TeamStatus.APPROVED);//duyet r nen khong cho khoa nua
            team.setInviteCode(null);//vo hieu hoa ma moi de khong cho ai dung lai ma moi nay
        } else {
            team.setStatus(TeamStatus.REJECTED);   // Admin từ chối
            req.setStatus(RequestStatus.REJECTED);

        }
        teamRepository.save(team);
        teamRequestRepository.save(req);

        return approve
                ? "Đội \"" + team.getName() + "\" đã được DUYỆT chính thức!"
                : "Đã TỪ CHỐI đội \"" + team.getName() + "\"";
    }


//tao ma random a

    private String generateUniqueInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++)
                sb.append(chars.charAt((random.nextInt(chars.length()))));
            code = sb.toString();

        } while (teamRepository.existsByInviteCode(code));
        return code;
    }


    //tra ve 1 team + so luong thanh vien
    private CreateTeamResponse toDto(Team team, int memberCount) {
        return new CreateTeamResponse(
                team.getId(),
                team.getName(),
                team.getInviteCode()
        );
    }


    //tra ve danh sach thanh vien trong team hien tai cua account

    public List<TeamMembersResponse> getAllMembers(long userId) {
        Member member = memberRepository.findByMemberID(userId).orElse(null);
        Team team = teamRepository.findById(member.getTeamId()).orElse(null);
        if (member == null || member.isStatus() == false) {
            throw new IllegalArgumentException("bạn chưa tham gia team nào");
        }
        List<Member> memberList = memberRepository.findByTeamId(member.getTeamId()).orElse(null);
        List<TeamMembersResponse> membersResponsesList = new ArrayList<>();
        for (Member member1 : memberList) {
            if (member1.isStatus()) {
                TeamMembersResponse membersResponse = new TeamMembersResponse();
                membersResponse.setId(member1.getId());
                membersResponse.setName(member1.getFullname());
                membersResponse.setEmail(member1.getEmail());
                membersResponse.setSchool(member1.getSchoolName());
                membersResponse.setLeader(member1.getRole() == MemberRole.LEADER);
                membersResponse.setCurrentUser(member1.getMemberID() == userId);
                membersResponsesList.add(membersResponse);
            }
        }
        return membersResponsesList;
    }


    //kick 1 thanh vien ---- xoa mem

    public String kickMember(long userId, long yourId) {
        Member member = memberRepository.findById(userId).orElse(null);
        Member you = memberRepository.findByMemberID(yourId).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("member không tồn tại");
        }
        if (you.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không có quyền kick");
        }

        if (!member.isStatus()) { // hoặc member.getStatus() == false tùy cách bạn đặt kiểu dữ liệu
            throw new IllegalArgumentException("Thành viên đã rời team trước đó");
        }
        member.setStatus(false);
        memberRepository.save(member);
        return "Kick thành công";
    }

    //    trao quyen truong nhom cho user khac

    public String promoteMember(long userId, long leaderId) {
        Member member = memberRepository.findById(userId).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("member không tồn tại");
        }
        Member leader = memberRepository.findByMemberID(leaderId).orElse(null);
        if (leader == null) {
            throw new IllegalArgumentException("leader không tồn tại");
        }

        if (leader.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không có quyền trao quyền");
        }
        member.setRole(MemberRole.LEADER);
        memberRepository.save(member);
        leader.setRole(MemberRole.MEMBER);
        memberRepository.save(leader);
        return "đã trao vị trí leader cho " + member.getFullname() + "Thành Công !";
    }

    //get role
    public String getTeamRole(long userId) {
        Member member = memberRepository.findByMemberID(userId)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        if (!member.isStatus()) {
            throw new IllegalArgumentException("MEMBER_NOT_FOUND");
        }

        return member.getRole().toString(); // Trả về "LEADER" hoặc "MEMBER"
    }

    //out team neu so luong active trong team hien tai chi la 1
    //thi set team status ve REJECTED

    public String outTeam(long userId) {
        Member member = memberRepository.findByMemberID(userId)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        member.setStatus(false);
        memberRepository.save(member);
        //dem so luong thanh vien trong team hien tai
        int teamCurrentMembers = memberRepository.countByTeamIdAndStatus(member.getTeamId(), true);
        if (teamCurrentMembers == 0) {
            Team team = teamRepository.findById(member.getTeamId()).orElse(null);
            team.setStatus(TeamStatus.REJECTED);
            teamRepository.save(team);
        }
        return "Out Team Thanh Cong";
    }


    // lay tat ca nhung doi dang need member
    public List<NeedMemberTeamResponse> getNeedMemberTeams(
            long userId
    ) {
//        Member user = memberRepository.findByMemberID(userId).orElse(null);
//        if (user == null) {
//            throw new IllegalArgumentException("MEMBER_NOT_FOUND");
//        }

        List<Team> needMemberTeams = teamRepository.findTeamsWithLessThanFourMembers();
        List<NeedMemberTeamResponse> needMemberTeamResponseList = new ArrayList<>();
        if (needMemberTeams.isEmpty()) {
            return Collections.emptyList();
        }

        for (Team team : needMemberTeams) {
            List<Member> memberList = memberRepository.findByTeamId(team.getId()).orElse(null);
            //da gui request toi team nay chua
            TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamIdAndTypeAndStatus(
                    userId,team.getId(),RequestType.JOIN_REQUEST,RequestStatus.PENDING
            );
            //da nhan invitation tu team nay chua
            TeamRequest teamInvitation=teamRequestRepository.findByReceiverIdAndTeamIdAndTypeAndStatus(
                    userId,team.getId(),RequestType.INVITATION,RequestStatus.PENDING
            );
            if(teamRequest!=null || teamInvitation!=null){
                continue;
            }
            //neu user da co yeu cau toi team nay roi thi ko hien thi team nay nua
            if (memberList == null || memberList.isEmpty()
                    || team.getStatus() != TeamStatus.OPEN
            ) {
                continue;
            }
            NeedMemberTeamResponse needMemberTeamResponse = new NeedMemberTeamResponse();
            needMemberTeamResponse.setTeamId(team.getId());
            needMemberTeamResponse.setTeamName(team.getName());
            for (Member member : memberList) {
                TeamMemberResponse memberResponse = new TeamMemberResponse();
                memberResponse.setId(member.getId());
                memberResponse.setName(member.getFullname());
                memberResponse.setSchool(member.getSchoolName());
                needMemberTeamResponse.addMember(memberResponse);
            }
            needMemberTeamResponseList.add(needMemberTeamResponse);
        }
        return needMemberTeamResponseList;
    }

    // get team info
    public TeamInfoResponse  getTeamInfo(long userId) {
        Team team=teamRepository.findById(userId).orElse(null);
        Member member =memberRepository.findByMemberID(userId).orElse(null);
        if (team == null || member == null || !member.isStatus()) {
            throw new IllegalArgumentException("team not found or user not found");
        }
        TeamInfoResponse teamInfoResponse = new TeamInfoResponse();
        teamInfoResponse.setTeamCode(team.getInviteCode());
        teamInfoResponse.setTeamName(team.getName());
        teamInfoResponse.setDescription(team.getDescription());
        return teamInfoResponse;
    }

    //leader send invitation --> mo rong nhung nguoi da duoc -leader goi
    // invitation roi thi khong hien len

    public String leaderSendInvitation(InvitationRequest invitationRequest, long senderId) {

        Team team=teamRepository.findByLeaderID(senderId).orElse(null);
        if (team == null) {
            return "ko tim thay team";
        }
    TeamRequest teamRequest = new TeamRequest(senderId,invitationRequest.getId(), team.getId(),RequestType.INVITATION, invitationRequest.getMessage()
    );
        teamRequestRepository.save(teamRequest);
        return "invitation thành công";
    }

}
