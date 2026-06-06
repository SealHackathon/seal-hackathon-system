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
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.MemberRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.TeamRequestRepository;
import com.minhtung.hackathon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.InvalidParameterException;
import java.time.LocalDate;
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


    // fix quăng lỗi của mail (chưa làm)
    @Transactional
    public CreateTeamResponse createTeam(CreateTeamDto newTeam, long leaderId) {
        User leader = userRepository.findById(leaderId).orElse(null);
        if (leader == null) {
            throw new IllegalArgumentException("nguoi tao team ko ton tai");
        }
        if (newTeam.getName() == null || newTeam.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đội không được để trống");
        }
        if (newTeam.getDescription().length() > 200) {
            throw new IllegalArgumentException("mo ta không thể lớn hơn 200 kí tự ");
        }

        if (memberRepository.existsByMemberIdAndStatus(leaderId, true)) {
            throw new IllegalArgumentException("Bạn thuộc team rồi nên không thể tham gia đăng kí vào team khác");
        }
        List<String> userEmails = newTeam.getInviteEmails();
        for (String email : userEmails) {
            User member = userRepository.findByEmail(email).orElse(null);
            if (member == null ) {

                throw new IllegalArgumentException("email bạn mời không tồn tại");
            }
            if (member.getEmail().equals(leader.getEmail())) {
                throw new IllegalArgumentException("Không thể nhập email của chính mình");
            }
        }
        String inviteCode = generateUniqueInviteCode();
        Team team = new Team(newTeam.getName(),TeamStatus.OPEN, LocalDate.now(),leader,inviteCode,newTeam.getDescription());
        team.setStatus(TeamStatus.OPEN);
        teamRepository.save(team);

        memberRepository.save(new Member(MemberRole.LEADER, true,team,leader));

        // email list
        List<String> emails = newTeam.getInviteEmails();
        if (emails != null) {

            for (String email : emails) {
                if (email == null || email.trim().isEmpty()) {
                    continue;
                }

                // lay user duoc moi neu khong thi tra ve message
                User invitedUsers = userRepository.findByEmail(email.trim()).orElse(null);
                if(invitedUsers == null) {
                    throw new IllegalArgumentException("user email bạn mời không tồn tại");
                }
                Member member=memberRepository.findByMemberIdAndStatus(invitedUsers.getId(),true).orElse(null);
                if(member!=null) {
                    throw new IllegalArgumentException("user email bạn mời đã ở trong đội khác rồi");
                }


                //luu teamRequest loai invitation(nguoi duoc moi can bam dong y de duoc tham gia vao team
                TeamRequest invitenation = new TeamRequest(RequestStatus.PENDING, leader, invitedUsers, team, RequestType.INVITATION,"Bạn được " + leader.getFullName() + " Mời vào team " + team.getName());
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
        Team team = teamRepository.findByInviteCodeAndStatus(inviteCode,TeamStatus.OPEN).orElseThrow(() -> new IllegalArgumentException("Mã mời không hợp lệ hoặc không tồn tại"));


        // nhung team nao open thi moi tham gia vao
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("Đội hiện tại đã đóng, không thể tiếp nhận thành viên mới");
        }

        //kiem tra xem ban co thuoc team nao chua
        if (memberRepository.existsByTeamIdAndMemberIdAndStatus(team.getId(), userId, true)) {
            ;
            throw new IllegalArgumentException("Bạn đã là thành viên của đội " + team.getName() + " rồi!");
        }
        //yeu cau roi doi truoc khi muon tham gia
        if (memberRepository.existsByMemberIdAndStatus(userId, true)) {
            throw new IllegalArgumentException("Bạn đang tham gia một đội khác. Vui lòng rời đội cũ trước khi muốn gia nhập đội mới!");
        }

        int currentCount = memberRepository.countByTeamIdAndStatus(team.getId(), true);
        if (currentCount >= 4) {
            throw new IllegalArgumentException("Đội " + team.getName() + " đã đủ tối đa 4 thành viên rồi!");
        }
        User user = userRepository.findById(userId).orElseThrow();

        memberRepository.save(new Member(MemberRole.MEMBER, true, team, user));
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
        User sender=userRepository.findById(userId).orElse(null);
        if (sender == null) {
            throw new IllegalArgumentException("không tim thấy nguoi gui ");
        }
        if (team == null) {
            throw new IllegalArgumentException("không tim thấy đội ");
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("đội nay không còn nhận thành viên nữa");
        }
        if (memberRepository.existsByTeamIdAndMemberIdAndStatus(joinTeamRequest.getTeamId(), userId, true)) {
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
        teamRequestRepository.save(new TeamRequest(RequestStatus.PENDING, sender, team.getLeader(), team,RequestType.JOIN_REQUEST, joinTeamRequest.getMessage()));
        return "đã gửi yêu cầu tham gia đội đến team " + team.getName() + " thành công";
    }

    //ham nay leader xem nhung join team request

    public List<JoinTeamResponse> viewJoinTeamRequest(long leaderId) {
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId,true).orElseThrow();
        if (leader == null || leader.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không phải leader");
        }
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null || team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("team không tồn tại!");
        }
        List<TeamRequest> joinTeamRequests = teamRequestRepository.findByTypeAndStatusAndTeamId(RequestType.JOIN_REQUEST, RequestStatus.PENDING, team.getId());

        List<JoinTeamResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : joinTeamRequests) {
            User user = userRepository.findById(teamRequest.getSender().getId()).orElse(null);
            if (user == null) {
                continue;
            }
            JoinTeamResponse joinTeamResponse = new JoinTeamResponse();
            joinTeamResponse.setId(teamRequest.getId());
            joinTeamResponse.setName(user.getFullName());
            joinTeamResponse.setEmail(user.getEmail());
            joinTeamResponse.setMessage(teamRequest.getMessage());
            responseList.add(joinTeamResponse);
        }
        return responseList;
    }

    //leader xem nhung invitation da gui di
    //fix tinh nang lai la view qua teamId chu ko phai view qua senderId
    public List<LeaderInvitationResponse> leaderViewInvitation(long userId) {
        Member leader = memberRepository.findByMemberIdAndStatus(userId,true).orElseThrow();
        if (leader.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không phải leader");
        }
        Team team = teamRepository.findByLeaderId(userId).orElse(null);
        if (team == null || team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("leader ko ton tai hoac team ko open");
        }
        List<TeamRequest> teamRequests = teamRequestRepository.findByTypeAndStatusAndTeamId(RequestType.INVITATION, RequestStatus.PENDING, team.getId());
        List<LeaderInvitationResponse> responseList = new ArrayList<>();
        for (TeamRequest teamRequest : teamRequests) {
            LeaderInvitationResponse leaderInvitationResponse = new LeaderInvitationResponse();
            User user = userRepository.findById(teamRequest.getReceiver().getId()).orElse(null);
            if (user == null) {
                continue;
            }
            leaderInvitationResponse.setId(user.getId());
            leaderInvitationResponse.setName(user.getFullName());
            leaderInvitationResponse.setMemberId(user.getId());
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
            memberInvitationResponse.setTeamName(teamRepository.findById(teamRequest.getTeam().getId()).orElse(null).getName());
            memberInvitationResponse.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeam().getId(), true));
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
            res.setTeamName(teamRepository.findById(teamRequest.getTeam().getId()).orElse(null).getName());
            res.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeam().getId(), true));
            res.setMaxSlots(4);
            responseList.add(res);
        }
        return responseList;
    }

    //leader xoa nhung invitation da gui by request Id
    public String deleteInvitation(long requestId, long leaderId) {
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            return "Team Khong Ton Tai";
        }
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId,true).orElse(null);
        if (leader == null || leader.getRole() != MemberRole.LEADER) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }
        TeamRequest teamRequest = teamRequestRepository.findById(requestId).orElse(null);
        if (teamRequest == null) {
            return "loi roi";
        }
        if (teamRequest.getStatus() != RequestStatus.PENDING) {
            return "request da duoc xu ly hoac ko ton tai";
        }
        teamRequestRepository.delete(teamRequest);
        return "xoa thanh cong invitation!";

    }

    //leader xoa nhung invitation da gui by Member id
    // tim nhung invitation vao team cua leader den user do roi xoa
    public String deleteInvitationByMemberId(long memberId, long leaderId) {
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("Team Khong Ton Tai");
        }
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId,true).orElse(null);
        if (leader == null || leader.getRole() != MemberRole.LEADER) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }

        // sua lai la teamRequest phai lay theo teamId
        TeamRequest teamRequest = teamRequestRepository.findByReceiverIdAndTeamIdAndTypeAndStatus(memberId, team.getId(), RequestType.INVITATION,
                RequestStatus.PENDING).orElse(null);
        if (teamRequest == null) {
            return "loi roi";
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

        TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamIdAndStatus(userId, teamId,RequestStatus.PENDING);
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
    // phai check neu team day thi ko cho vo
    //team đã full thì vào ko đc
    @Transactional
    public String respondToInvitation(Long requestId, boolean acp, long userId) {
        TeamRequest req = teamRequestRepository.findById(requestId).orElse(null);
        if (req == null) {
            return "Không tìm thấy lời mời";
        }
        if (!req.getReceiver().getId().equals(userId)) {
            return "ban không phải người nhận lời mời";
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            return "loi moi da duoc xu ly roi";

        }
        if (acp) {
            Team team = teamRepository.findById(req.getTeam().getId()).orElse(null);
            if (team == null || team.getStatus() != TeamStatus.OPEN) {
                req.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(req);
            }
            if (memberRepository.countByTeamIdAndStatus(team.getId(), true) >= 4) {
                req.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(req);
                return "doi cua bạn da du va khong con nhan thanh vien nua";
            }
            if (memberRepository.existsByMemberIdAndStatus(userId, true)) {
                return "ban thuoc team khac roi can out de vao nhom khac";
            }
            int count = memberRepository.countByTeamIdAndStatus(team.getId(), true);
            if (count ==4) {
                return "Team da du 4 nguoi roi";
            }


            User user = userRepository.findById(userId).orElseThrow();

            memberRepository.save(new Member(MemberRole.MEMBER, true,team,user));
            req.setStatus(RequestStatus.APPROVED);
            teamRequestRepository.save(req);
        } else {
            req.setStatus(RequestStatus.REJECTED);
            teamRequestRepository.save(req);
        }
        teamRequestRepository.save(req);
        return acp ? "Đã tham gia đội thành công!" : "Đã từ chối lời mời";
    }

    //Leader duyet / tu choi join request
    //neu team da full thi ko cho vao
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
            Member leader = memberRepository.findByMemberIdAndStatus(leaderId,true).orElse(null);
            if (leader.getRole() != MemberRole.LEADER || leader == null) {
                return "ban ko co quyen thuc hien chuc nang nay";
            }

            User user = userRepository.findById(teamRequest.getSender().getId()).orElse(null);
            if (user == null) {
                throw new IllegalArgumentException("User not found");
            }
            Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
            if(team==null){
                throw new IllegalArgumentException("Team not found");
            }
            int countMember=memberRepository.countByTeamIdAndStatus(team.getId(), true);

             if (countMember ==4) {
                    teamRequest.setStatus(RequestStatus.REJECTED);
                    teamRequestRepository.save(teamRequest);
              return "team da du thanh vien roi";
            }


            if (acp) {
                memberRepository.save(new Member(
                        MemberRole.MEMBER, true, teamRequest.getTeam(),user));

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
//    @Transactional
//    public String requestLeave(Long teamID, long userId) {
//        Member member = memberRepository.findByTeamIdAndMemberId(teamID, userId).orElse(null);
//        if (member == null || !member.isStatus()) {
//            return "ban khong thuoc doi nay ";
//        }
//        if (member.getRole() == MemberRole.LEADER) {
//            return "ban la leader nen khong the roi doi duoc ";
//        }
//        Team team = teamRepository.findById(teamID).orElse(null);
//        if (team == null) {
//            return "khong tim thay doi nay";
//        }
//        if (team.getStatus() == TeamStatus.APPROVED) {
//            return "đội của bạn đã được duyệt rôi , không thể rời đội";
//        }
//        if (teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(userId, teamID, RequestType.LEAVE_REQUEST, RequestStatus.PENDING)) {
//
//            return "bạn đã gửi yêu  cầu xin ròi nhóm , cần được admin duyệt ";
//        }
//        teamRequestRepository.save(new TeamRequest(RequestStatus.PENDING,leader, "Thanh Vien " + userRepository.findById(userId).get().getFullName() + "Xin Roi khoi doi"));
//
//        return "đã gửi yêu cầu rời đội , chờ leader duyệt ";
//
//    }

    //8 day la ham dung de leadder duyet vuec leave_request trong team

    @Transactional
    public String respondToLeaveRequest(Long requestId, boolean acp, int leaderId) {
        TeamRequest req = teamRequestRepository.findById(requestId).orElse(null);
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId,true).orElse(null);
        if (req == null) {
            return "không tìm thấy yêu câu rời đội";
        }
        if (req.getType() != RequestType.LEAVE_REQUEST) {
            return "đây không phải yêu cầu rời đội";
        }
        if (!req.getReceiver().getId().equals(leaderId)) {
            return "ban khong phai leader cua doi nay";
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            return "yeu cau nay da duoc xu ly roi";
        }

        if (leader.getRole() != MemberRole.LEADER || leader == null) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }

        if (acp) {
            Member member = memberRepository.findByTeamIdAndMemberId(req.getTeam().getId(), req.getSender().getId()).orElse(null);
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
//    @Transactional
//    public String submitTeamForApporal(int teamId, long leaderId) {
//        Team team = teamRepository.findById(leaderId).orElse(null);
//        if (team == null) {
//            return "khong tim thay doi";
//        }
//        if (team.getLeader().getId() != leaderId) {
//            return "Chỉ Leader mới có quyền chốt đội";
//        }
//        if (team.getStatus() != TeamStatus.OPEN) {
//            return "doi phai o trang thai open thi moi choi duoc ";
//        }
//
//        int count = memberRepository.countByTeamIdAndStatus(teamId, true);
//        if (count == 4) {
//            return "đội phải đủ 4 người mới được submit";
//        }
//
//        boolean alreadySumbit = teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(leaderId, teamId, RequestType.TEAM_SUBMISSION, RequestStatus.PENDING);
//
//        if (alreadySumbit) {
//            return "doi dang cho admin duyet ";
//        }
//        ;
//        team.setStatus(TeamStatus.APPROVED);
//        teamRepository.save(team);
//
//
//        teamRequestRepository.save(new TeamRequest(RequestStatus.APPROVED, 0, teamId, RequestType.TEAM_SUBMISSION, "Team " + team.getName() + "Yeu Cau duoc xac thuc"));
//
//        return "da nop roi " + team.getName() + "dang cho admin duyet nha";
//    }

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
        Team team = teamRepository.findById(req.getTeam().getId()).orElse(null);
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
    @Transactional
    public List<TeamMembersResponse> getAllMembers(long userId) {
        Member member = memberRepository.findByMemberIdAndStatus(userId,true).orElse(null);
        Team team = teamRepository.findById(member.getTeam().getId()).orElse(null);
        if (member == null || member.isStatus() == false) {
            throw new IllegalArgumentException("bạn chưa tham gia team nào");
        }
        List<Member> memberList = memberRepository.findByTeamId(member.getTeam().getId()).orElse(null);
        List<TeamMembersResponse> membersResponsesList = new ArrayList<>();
        for (Member member1 : memberList) {
            if (member1.isStatus()) {
                TeamMembersResponse membersResponse = new TeamMembersResponse();
                membersResponse.setId(member1.getId());
                membersResponse.setName(member1.getMember().getFullName());
                membersResponse.setEmail(member1.getMember().getEmail());
                membersResponse.setSchool(member1.getMember().getSchoolName());
                membersResponse.setLeader(member1.getRole() == MemberRole.LEADER);
                membersResponse.setCurrentUser(member1.getMember().getId() == userId);
                membersResponsesList.add(membersResponse);
            }
        }
        int memberCount = memberRepository.countByTeamIdAndStatus(team.getId(),true);
        if (memberCount == 4) {
            List<TeamRequest> teamRequestList=team.getTeamRequest();
            for (TeamRequest teamRequest : teamRequestList) {
                teamRequest.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(teamRequest);
            }
        }
        return membersResponsesList;
    }


    //kick 1 thanh vien ---- xoa mem

    public String kickMember(long userId, long yourId) {
        Member member = memberRepository.findById(userId).orElse(null);
        Member you = memberRepository.findByMemberIdAndStatus(yourId,true).orElse(null);
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
    @Transactional
    public String promoteMember(long userId, long leaderId) {
        //frontend dang truyen xuong id cua cot primarykey cua member chu ko phai userid
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("Team không tồn tại");
        }
        List<Member> memberList = new ArrayList<>(team.getMembers());
        for (Member member : memberList) {
            if (member.getId() == userId) {
               User user=userRepository.findById(member.getMember().getId()).orElse(null);
               if (user == null) {
                   return "user ban promote ko ton tai";
               }
               member.setRole(MemberRole.LEADER);
                team.setLeader(user);
                memberRepository.save(member);
                teamRepository.save(team);
            }
            if(member.getMember().getId()== leaderId){
                member.setRole(MemberRole.MEMBER);
                memberRepository.save(member);
            }
        }
        return "đã trao vị trí leader cho Thành Công !";
    }

    //get role
    public String getTeamRole(long userId) {
        Member member = memberRepository.findByMemberIdAndStatus(userId,true)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        if (!member.isStatus()) {
            throw new IllegalArgumentException("MEMBER_NOT_FOUND");
        }

        return member.getRole().toString(); // Trả về "LEADER" hoặc "MEMBER"
    }

    //out team neu so luong active trong team hien tai chi la 1
    //thi set team status ve REJECTED
    @Transactional
    public String outTeam(long userId) {
        Member member = memberRepository.findByMemberIdAndStatus(userId,true)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        member.setStatus(false);
        memberRepository.save(member);
        //dem so luong thanh vien trong team hien tai
        Team team = teamRepository.findById(member.getTeam().getId()).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("TEAM NOT FOUND");
        }
        int teamCurrentMembers = memberRepository.countByTeamIdAndStatus(member.getTeam().getId(), true);
        if (teamCurrentMembers == 0) {
            teamRequestRepository.deleteAllByTeamId(team.getId());
            memberRepository.deleteAllByTeamId(team.getId());
            teamRepository.delete(team);
        }
        return "Out Team Thanh Cong";
    }


    // lay tat ca nhung doi dang need member

    public List<NeedMemberTeamResponse> getNeedMemberTeams(
            long userId
    ) {



        List<Team> needMemberTeams = teamRepository.findTeamsWithLessThanFourMembers();
        List<NeedMemberTeamResponse> needMemberTeamResponseList = new ArrayList<>();
        if (needMemberTeams.isEmpty()) {
            return Collections.emptyList();
        }

        for (Team team : needMemberTeams) {
            List<Member> memberList = memberRepository.findByTeamId(team.getId()).orElse(null);
            //da gui request toi team nay chua
            TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamIdAndTypeAndStatus(
                    userId, team.getId(), RequestType.JOIN_REQUEST, RequestStatus.PENDING
            ).orElse(null);
            //da nhan invitation tu team nay chua
            TeamRequest teamInvitation = teamRequestRepository.findByReceiverIdAndTeamIdAndTypeAndStatus(
                    userId, team.getId(), RequestType.INVITATION, RequestStatus.PENDING
            ).orElse(null);
            if (teamRequest != null || teamInvitation != null) {
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
            needMemberTeamResponse.setDescription(team.getDescription());

            for (Member member : memberList) {
                //ai đã out rồi thì bỏ qua
                if (!member.isStatus()) {
                    continue;
                }
                User user = userRepository.findById(member.getMember().getId()).orElse(null);
                if (user == null) {
                  continue;
                }
                TeamMemberResponse memberResponse = new TeamMemberResponse();
                memberResponse.setId(member.getId());
                memberResponse.setName(user.getFullName());
                memberResponse.setSchool(user.getSchoolName());
                if(member.getRole() == MemberRole.LEADER){
                    memberResponse.setLeader(true);
                }
                needMemberTeamResponse.addMember(memberResponse);

            }
            needMemberTeamResponseList.add(needMemberTeamResponse);
        }
        return needMemberTeamResponseList;
    }

    // get team info
    public TeamInfoResponse getTeamInfo(long userId) {
        Member member = memberRepository.findByMemberIdAndStatus(userId,true).orElse(null);
        Team team = teamRepository.findByLeaderId(userId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("team khong ton tai");
        }
        if (member == null || !member.isStatus()) {
            throw new IllegalArgumentException("Nguoi dung ko ton tai");
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
        User leader=userRepository.findById(senderId).orElse(null);
        if (leader == null) {
            return "sender ko ton tai";
        }
        User recevier=userRepository.findById(invitationRequest.getId()).orElse(null);

        Team team = teamRepository.findByLeaderId(senderId).orElse(null);
        if (team == null) {
            return "ko tim thay team";
        }
        TeamRequest teamRequest = new TeamRequest(RequestStatus.PENDING, leader,recevier, team, RequestType.INVITATION, invitationRequest.getMessage());
        teamRequestRepository.save(teamRequest);
        return "invitation thành công";
    }


    //check team name trong luc createTeam xem co bi trung k
    public boolean checkName( String name) {
        Team team = teamRepository.findByNameIgnoreCaseAndStatus(name,TeamStatus.OPEN).orElse(null);
        // neu ten chua ton tai thi return ve true
        if (team == null) {
            return true;
        }
        //ton tai roi thi tra ve false
        return false;
    }


    //    search join team by code
    public SearchTeamByCodeResponse checkCode(String code) {
        // tìm team đó
        // ko tìm đc trả về invalid
        // team đã đủ 4 người trả về full
        Team team = teamRepository.findByInviteCodeAndStatus(code,TeamStatus.OPEN).orElse(null);
        SearchTeamByCodeResponse searchTeamByCodeResponse = new SearchTeamByCodeResponse();
        if (team == null) {
          searchTeamByCodeResponse.setType("invalid");
          return searchTeamByCodeResponse;
        }
        int memberCount = memberRepository.countByTeamIdAndStatus(team.getId(),true);
        if(memberCount==4){
            searchTeamByCodeResponse.setType("full");
        }else{
            searchTeamByCodeResponse.setType("found");
        }

        TeamByCodeResponse teamByCodeResponse = new TeamByCodeResponse();
        teamByCodeResponse.setTeamName(team.getName());
        teamByCodeResponse.setDescription(team.getDescription());
        teamByCodeResponse.setMemberCount(memberCount);
        teamByCodeResponse.setMaxSlots(4);

        // add nhung member vo
        List<Member> members =memberRepository.findByTeamIdAndStatus(team.getId(),true);
        for (Member member : members) {
            MemberByCodeResponse memberByCodeResponse = new MemberByCodeResponse();
            memberByCodeResponse.setMemberId(member.getId());
            if (member.getRole() == MemberRole.LEADER) {
                memberByCodeResponse.setLeader(true);
            }
            memberByCodeResponse.setName(member.getMember().getFullName());
            memberByCodeResponse.setSchool(member.getMember().getSchoolName());
            teamByCodeResponse.addMember(memberByCodeResponse);
        }
        searchTeamByCodeResponse.setTeamCode(team.getInviteCode());
        searchTeamByCodeResponse.setTeam(teamByCodeResponse);

    return   searchTeamByCodeResponse;
    }
}
