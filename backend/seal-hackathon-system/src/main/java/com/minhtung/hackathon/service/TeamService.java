package com.minhtung.hackathon.service;


import com.minhtung.hackathon.dto.request.CreateTeamDto;
import com.minhtung.hackathon.dto.request.EdiTeamRequest;
import com.minhtung.hackathon.dto.request.InvitationRequest;
import com.minhtung.hackathon.dto.response.CreateTeamResponse;
import com.minhtung.hackathon.dto.request.JoinTeamRequest;
import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.dto.round.RoundTeamResponse;
import com.minhtung.hackathon.dto.round.SubmissionContent;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.InvalidParameterException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentprofileRepository studentprofileRepository;
    private final TrackRepository trackRepository;
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
        if (!leader.isActive()) {
            throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
        }
        if (newTeam.getDescription().length() > 200) {
            throw new IllegalArgumentException("mo ta không thể lớn hơn 200 kí tự ");
        }
        if (leader.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("chua duoc admin duyet ");
        }

        //đã là thí sinh của team khác thì ko đc
        if (memberRepository.existsByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL)
                || memberRepository.existsByMemberIdAndStatus(leaderId, MemberStatus.RESERVE)
        ) {
            throw new IllegalArgumentException("Bạn thuộc team rồi nên không thể tham gia đăng kí vào team khác");
        }
        List<String> userEmails = newTeam.getInviteEmails();
        if (userEmails.size() != new HashSet<>(userEmails).size()) {
            throw new IllegalArgumentException("Danh sách email có thành viên bị trùng");
        }
        for (String email : userEmails) {
            User member = userRepository.findByEmail(email).orElse(null);
            if (member == null) {

                throw new IllegalArgumentException("email bạn mời không tồn tại");
            }
            if (!member.isActive()) {
                throw new IllegalArgumentException("Thành viên " + email + " chưa xác nhận Gmail");
            }

            if (member.getStatus() != UserStatus.ACCEPTED) {
                throw new IllegalArgumentException("Thành viên " + email + " chưa được admin duyệt");
            }
            if (member.getEmail().equals(leader.getEmail())) {
                throw new IllegalArgumentException("Không thể nhập email của chính mình");
            }

        }
        String inviteCode = generateUniqueInviteCode();
        Team team = new Team(newTeam.getName(), TeamStatus.OPEN, LocalDate.now(), leader, inviteCode, newTeam.getDescription());
        team.setStatus(TeamStatus.OPEN);
        teamRepository.save(team);


        //leader duoc luu xuong la thanh vien chinh thuc
        memberRepository.save(new Member(MemberRole.LEADER, MemberStatus.OFFICAL, team, leader, JoinMethod.CREATETEAM));

        // email list
        List<String> emails = newTeam.getInviteEmails();
        if (emails != null) {

            for (String email : emails) {
                if (email == null || email.trim().isEmpty()) {
                    continue;
                }

                // lay user duoc moi neu khong thi tra ve message
                User invitedUsers = userRepository.findByEmail(email.trim()).orElse(null);
                if (invitedUsers == null) {
                    throw new IllegalArgumentException("user email bạn mời không tồn tại");
                }
                // user ở trạng thái Reserve vẫn co thể đc mời.
                Member member = memberRepository.findByMemberIdAndStatusIn(invitedUsers.getId(), List.of(MemberStatus.OFFICAL)).orElse(null);
                if (member != null) {
                    throw new IllegalArgumentException("user email bạn mời đã ở trong đội khác rồi");
                }


                //luu teamRequest loai invitation(nguoi duoc moi can bam dong y de duoc tham gia vao team
                TeamRequest invitenation = new TeamRequest(RequestStatus.PENDING, leader, invitedUsers, team, RequestType.INVITATION, "Bạn được " + leader.getFullName() + " Mời vào team " + team.getName());
                teamRequestRepository.save(invitenation);
            }
        }

        int memberCount = memberRepository.countByTeamIdAndStatus((int) team.getId(), MemberStatus.OFFICAL);
        return toDto(team, memberCount);

    }

    //2. day la ham tham gia doi bang loi moi
    //luat la chi doi dang co Open moi co the join bang ma
    // tu dong them member ma khong can admin duyet
    @Transactional
    public String joinTeamByCode(String inviteCode, long userId) {
        Team team = teamRepository.findByInviteCodeAndStatus(inviteCode, TeamStatus.OPEN).orElseThrow(() -> new IllegalArgumentException("Mã mời không hợp lệ hoặc không tồn tại"));


        // nhung team nao open thi moi tham gia vao
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("Đội hiện tại đã đóng, không thể tiếp nhận thành viên mới");
        }

        //kiem tra xem ban co thuoc team nao chua
        if (memberRepository.existsByTeamIdAndMemberIdAndStatusIn(team.getId(), userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE))) {
            ;
            throw new IllegalArgumentException("Bạn đã là thành viên của đội " + team.getName() + " rồi!");
        }
        //yeu cau roi doi truoc khi muon tham gia
        if (memberRepository.existsByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE))) {
            throw new IllegalArgumentException("Bạn đang tham gia một đội khác. Vui lòng rời đội cũ trước khi muốn gia nhập đội mới!");
        }

        // chuyen thanh check da chot team chưa

        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("Đội " + team.getName() + " đã không con nhan thanh vien nua roi!");
        }
        User user = userRepository.findById(userId).orElseThrow();
        if (!user.isActive()) {
            throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
        }

        if (user.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("Tài khoản chưa được admin duyệt nên chưa thể tham gia đội");
        }

        memberRepository.save(new Member(MemberRole.MEMBER, MemberStatus.RESERVE, team, user, JoinMethod.JOINBYCODE));
        //sau khi tham gia doi thanh cong chuyen het nhung request ve rejected
        List<TeamRequest> teamRequests = teamRequestRepository.findBySenderIdOrReceiverId(userId, userId);
        for (TeamRequest teamRequest : teamRequests) {
            teamRequest.setStatus(RequestStatus.REJECTED);
        }

        return "tham gia đội " + team.getName() + " thành công";

    }


    //ham nay de gui join request
    // dieu kien nhung team dang o trang thai open moi co
    //can leader duyet nưa nha

    @Transactional
    public String sendJoinRequest(JoinTeamRequest joinTeamRequest, long userId) {
        Team team = teamRepository.findById(joinTeamRequest.getTeamId()).orElse(null);
        User sender = userRepository.findById(userId).orElse(null);
        if (sender == null) {
            throw new IllegalArgumentException("không tim thấy nguoi gui ");
        }
        if (!sender.isActive()) {
            throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
        }

        if (sender.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("Tài khoản chưa được admin duyệt nên chưa thể gửi yêu cầu tham gia đội");
        }
        if (team == null) {
            throw new IllegalArgumentException("không tim thấy đội ");
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("đội nay không còn nhận thành viên nữa");
        }
        if (memberRepository.existsByTeamIdAndMemberIdAndStatusIn(joinTeamRequest.getTeamId(), userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE))) {
            ;
            throw new IllegalArgumentException("ban da o trong doi khac roi");
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("doi nay da ko con nhan thanh vien nua");
        }
        //khuc nay la do leader duyet
        if (teamRequestRepository.existsBySenderIdAndTeamIdAndTypeAndStatus(userId, joinTeamRequest.getTeamId(), RequestType.JOIN_REQUEST, RequestStatus.PENDING)) {
            return " bạn đã  yêu cầu vui lòng đợi leader duyệt";
        }
        teamRequestRepository.save(new TeamRequest(RequestStatus.PENDING, sender, team.getLeader(), team, RequestType.JOIN_REQUEST, joinTeamRequest.getMessage()));
        return "đã gửi yêu cầu tham gia đội đến team " + team.getName() + " thành công";
    }

    //ham nay leader xem nhung join team request

    public List<JoinTeamResponse> viewJoinTeamRequest(long leaderId) {
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL).orElseThrow();
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
        Member leader = memberRepository.findByMemberIdAndStatus(userId, MemberStatus.OFFICAL).orElseThrow();
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
            memberInvitationResponse.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeam().getId(), MemberStatus.OFFICAL));
            memberInvitationResponse.setMaxSlots(5);
            memberInvitationResponse.setMessage(teamRequest.getMessage());
            memberInvitationResponse.setDescription(teamRequest.getTeam().getDescription());


            //trả danh sách member chính thức để hiển thị kèm thông tin team
            List<Member> members = teamRequest.getTeam().getMembers();
            for (Member member : members) {
                if (member.getStatus() != MemberStatus.OFFICAL) {
                    continue;
                }
                TeamMemberResponse teamMemberResponse = new TeamMemberResponse();
                teamMemberResponse.setId(member.getId());
                teamMemberResponse.setName(member.getMember().getFullName());
                teamMemberResponse.setSchool(member.getMember().getSchoolName());
                if (member.getRole() == MemberRole.LEADER) {
                    teamMemberResponse.setLeader(true);
                } else {
                    teamMemberResponse.setLeader(false);
                }
                memberInvitationResponse.addMember(teamMemberResponse);
            }

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
            res.setMemberCount(memberRepository.countByTeamIdAndStatus(teamRequest.getTeam().getId(), MemberStatus.OFFICAL));
            res.setMaxSlots(5);
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
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL).orElse(null);
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
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL).orElse(null);
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

        TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamIdAndStatus(userId, teamId, RequestStatus.PENDING);
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
            //
            if (team.getStatus() != TeamStatus.OPEN) {
                req.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(req);
                return "doi cua bạn da dong va khong con nhan thanh vien nua";
            }

            // đang là dự bị vẫn có thể vào team khác
            if (memberRepository.existsByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL))) {
                return "ban thuoc team khac roi can out de vao nhom khac";
            }

            Member member = memberRepository.findByMemberIdAndStatus(userId, MemberStatus.RESERVE).orElse(null);
            if (member != null) {
                member.setStatus(MemberStatus.OUT);
                memberRepository.save(member);
            }


            User user = userRepository.findById(userId).orElseThrow();

            if (!user.isActive()) {
                throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
            }

            if (user.getStatus() != UserStatus.ACCEPTED) {
                throw new IllegalArgumentException("Tài khoản chưa được admin duyệt nên chưa thể nhận lời mời");
            }

            memberRepository.save(new Member(MemberRole.MEMBER, MemberStatus.OFFICAL, team, user, JoinMethod.JOINBYINVITATION));
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
        Member leader = memberRepository.findByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL).orElse(null);
        if (leader.getRole() != MemberRole.LEADER || leader == null) {
            return "ban ko co quyen thuc hien chuc nang nay";
        }

        User user = userRepository.findById(teamRequest.getSender().getId()).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        if (!user.isActive()) {
            throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
        }

        if (user.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("Tài khoản chưa được admin duyệt nên chưa thể nhận lời mời");
        }
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("Team not found");
        }
        if (team.getStatus() != TeamStatus.OPEN) {
            throw new IllegalArgumentException("Team da dong va ko nhan thanh vien nua");
        }

        User leaderUser = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("Leader không tồn tại"));

        if (leaderUser.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("Leader chưa được admin duyệt");
        }
        if (acp) {
            memberRepository.save(new Member(
                    MemberRole.MEMBER, MemberStatus.OFFICAL, teamRequest.getTeam(), user, JoinMethod.JOINBYREQUEST));

            teamRequest.setStatus(RequestStatus.APPROVED);
            teamRequestRepository.save(teamRequest);

            List<TeamRequest> teamRequests = teamRequestRepository.findBySenderId(user.getId());
            for (TeamRequest tr : teamRequests) {
                if (tr.getStatus() == RequestStatus.PENDING) {
                    tr.setStatus(RequestStatus.REJECTED);
                }
            }
            teamRequestRepository.saveAll(teamRequests);

            return "Ban da chap nhan cho " + user.getFullName() + " vao team";
        }

        teamRequest.setStatus(RequestStatus.REJECTED);
        teamRequestRepository.save(teamRequest);
        return "Ban da Tu choi cho " + user.getFullName() + " vao team";
    }


    // day la ham dung de leader duyet viec leave_request trong team
    // memberId trong đây là primary key của bảng member á nha.
    @Transactional
    public String respondToLeaveRequest(long memberId, long leaderId) {
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        Member memberSender = memberRepository.findByIdAndStatus(memberId, MemberStatus.OFFICAL).orElse(null);
        if (memberSender == null) {
            throw new IllegalArgumentException("MEMBER not found");

        }
        User user = memberSender.getMember();
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        if (team == null) {
            throw new IllegalArgumentException("Team not found");
        }
        TeamRequest teamRequest = teamRequestRepository.findBySenderIdAndTeamIdAndTypeAndStatus(user.getId(), team.getId(), RequestType.LEAVE_REQUEST, RequestStatus.PENDING).orElse(null);
        if (teamRequest == null) {
            throw new IllegalArgumentException("Leave Request not found");
        }
        memberSender.setStatus(MemberStatus.OUT);
        memberRepository.save(memberSender);
        return "Duyet yeu cau roi doi ko thanh cong";
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
        Team team = teamRepository.findById(req.getTeam().getId()).orElse(null);
        if (team == null) {
            return "khong tim thay doi";

        }
        if (approve) {
            team.setStatus(TeamStatus.APPROVED);//duyet r nen khong cho khoa nua
            team.setInviteCode(null);//vo hieu hoa ma moi de khong cho ai dung lai ma moi nay

            // Tự động kick tất cả thành viên dự bị (RESERVE) và gửi email thông báo
            List<Member> reserveMembers = memberRepository.findByTeamIdAndStatus(team.getId(), MemberStatus.RESERVE);
            for (Member reserveMember : reserveMembers) {
                reserveMember.setStatus(MemberStatus.OUT);
                memberRepository.save(reserveMember);
                // Gửi email thông báo cho thành viên bị kick
                User kickedUser = reserveMember.getMember();
                if (kickedUser != null && kickedUser.getEmail() != null) {
                    emailService.sendReserveMemberKickedEmail(
                            kickedUser.getEmail(),
                            kickedUser.getFullName() != null ? kickedUser.getFullName() : kickedUser.getEmail(),
                            team.getName()
                    );
                }
            }
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
    public List<TeamMembersResponseDetail> getAllMembers(long userId) {
        Member member = memberRepository.findByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE)).orElse(null);
        Team team = teamRepository.findById(member.getTeam().getId()).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("bạn chưa tham gia team nào");
        }
        List<Member> memberList = memberRepository.findByTeamId(member.getTeam().getId()).orElse(null);
        List<TeamMembersResponseDetail> membersResponsesList = new ArrayList<>();
        for (Member member1 : memberList) {
            if (member1.getStatus() != MemberStatus.OUT) {
                TeamMembersResponseDetail membersResponse = new TeamMembersResponseDetail();
                User user = member1.getMember();
                Student_profile profile = studentprofileRepository.findByUserId(user.getId()).orElse(null);
                if (profile != null) {
                    membersResponse.setBio(profile.getBio());
                    membersResponse.setPositions(profile.getPositions());
                    membersResponse.setTechTags(profile.getTechTags());
                    membersResponse.setTopics(profile.getTopics());
                    membersResponse.setCvLink("đang hard code chưa fix chỗ cv này");
                }
                membersResponse.setJoinMethod(member1.getJoinMethod().toString());
                membersResponse.setMemberStatus(member1.getStatus().toString());
                membersResponse.setId(member1.getId());
                membersResponse.setName(member1.getMember().getFullName());
                membersResponse.setEmail(member1.getMember().getEmail());
                membersResponse.setSchool(member1.getMember().getSchoolName());
                membersResponse.setLeader(member1.getRole() == MemberRole.LEADER);
                membersResponse.setCurrentUser(member1.getMember().getId() == userId);
                membersResponsesList.add(membersResponse);
            }
        }
        return membersResponsesList;
    }


    //kick 1 thanh vien ---- xoa mem

    public String kickMember(long userId, long yourId) {
        Member member = memberRepository.findById(userId).orElse(null);
        Member you = memberRepository.findByMemberIdAndStatus(yourId, MemberStatus.OFFICAL).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("member không tồn tại");
        }
        if (you.getRole() != MemberRole.LEADER) {
            throw new IllegalArgumentException("Bạn không có quyền kick");
        }

        if (member.getStatus() == MemberStatus.OUT) { // hoặc member.getStatus() == false tùy cách bạn đặt kiểu dữ liệu
            throw new IllegalArgumentException("Thành viên đã rời team trước đó");
        }
        member.setStatus(MemberStatus.OUT);
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
                User user = userRepository.findById(member.getMember().getId()).orElse(null);
                if (user == null) {
                    return "user ban promote ko ton tai";
                }
                member.setRole(MemberRole.LEADER);
                team.setLeader(user);
                memberRepository.save(member);
                teamRepository.save(team);
            }
            if (member.getMember().getId() == leaderId) {
                member.setRole(MemberRole.MEMBER);
                memberRepository.save(member);
            }
        }
        return "đã trao vị trí leader cho Thành Công !";
    }

    //get role
    public String getTeamRole(long userId) {
        Member member = memberRepository.findByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE))
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng


        return member.getRole().toString(); // Trả về "LEADER" hoặc "MEMBER"
    }

    //out team neu so luong active trong team hien tai chi la 1 xoa lun team
    @Transactional
    public OutTeamResponse outTeam(long userId) {
        Member member = memberRepository.findByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE))
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        // gui 1 leave request den team
        Team team = member.getTeam();
        User leader = team.getLeader();
        User sender = member.getMember();
        if (team == null || leader == null || sender == null) {
            throw new IllegalArgumentException("team or leader or member is null");
        }

        TeamRequest teamRequest = new TeamRequest(RequestStatus.PENDING, sender, leader, team,
                RequestType.LEAVE_REQUEST, "Thành viên " + sender.getFullName() + " xin rời đội.");
        teamRequestRepository.save(teamRequest);
        OutTeamResponse outTeamResponse = new OutTeamResponse();
        outTeamResponse.setId(teamRequest.getId());
        outTeamResponse.setMemberId(member.getId());
        outTeamResponse.setName(sender.getFullName());
        outTeamResponse.setMessage("Thành viên " + sender.getFullName() + " xin rời đội.");
        if (member.getStatus().equals(MemberStatus.RESERVE)) {
            member.setStatus(MemberStatus.OUT);
            memberRepository.save(member);
        }

        //dem so luong thanh vien trong team hien tai
        int teamCurrentMembers = memberRepository.countByTeamIdAndStatus(team.getId(), MemberStatus.OFFICAL);
        if (teamCurrentMembers == 1) {
            teamRequestRepository.deleteAllByTeamId(team.getId());
            memberRepository.deleteAllByTeamId(team.getId());
            teamRepository.delete(team);
        }

        return outTeamResponse;
    }

    //cancle out-team
    @Transactional
    public String outTeamCancle(long userId) {
        Member member = memberRepository.findByMemberIdAndStatus(userId, MemberStatus.OFFICAL)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        // gui 1 leave request den team
        Team team = member.getTeam();
        List<TeamRequest> teamRequests = new ArrayList<>(team.getTeamRequest());
        if (member.getMember().equals(team.getLeader())) {
            for (TeamRequest teamRequest : teamRequests) {
                if (teamRequest.getReceiver().equals(member.getMember())
                        && teamRequest.getType() == RequestType.LEAVE_REQUEST &&
                        teamRequest.getStatus() == RequestStatus.PENDING
                ) {
                    teamRequest.setStatus(RequestStatus.REJECTED);
                    teamRequestRepository.save(teamRequest);
                    return "đã tu choi cầu rời đội thành công";
                }
            }
        }

        for (TeamRequest teamRequest : teamRequests) {
            if (teamRequest.getSender().equals(member.getMember())
                    && teamRequest.getType() == RequestType.LEAVE_REQUEST &&
                    teamRequest.getStatus() == RequestStatus.PENDING
            ) {
                teamRequest.setStatus(RequestStatus.REJECTED);
                teamRequestRepository.save(teamRequest);
                return "đã hủy yêu cầu rời đội thành công";
            }
        }
        return "Ko tìm thấy yêu cầu rời đội";
    }

    //leader get leaveRequest
    @Transactional
    public List<OutTeamResponse> getLeaveRequestList(long leaderId) {
        Member member = memberRepository.findByMemberIdAndStatus(leaderId, MemberStatus.OFFICAL)
                .orElseThrow(() -> new IllegalArgumentException("MEMBER_NOT_FOUND")); // Ném ra ngoại lệ rõ ràng
        // gui 1 leave request den team
        Team team = member.getTeam();
        List<TeamRequest> teamRequests = new ArrayList<>(team.getTeamRequest());
        List<OutTeamResponse> outTeamResponses = new ArrayList<>(teamRequests.size());
        for (TeamRequest teamRequest : teamRequests) {
            if ((teamRequest.getReceiver().equals(member.getMember()) || teamRequest.getSender().equals(member.getMember())) &&
                    teamRequest.getType() == RequestType.LEAVE_REQUEST &&
                    teamRequest.getStatus() == RequestStatus.PENDING
            ) {
                OutTeamResponse outTeamResponse = new OutTeamResponse();
                outTeamResponse.setId(teamRequest.getId());
                outTeamResponse.setMemberId(teamRequest.getId());
                outTeamResponse.setName(teamRequest.getSender().getFullName());
                outTeamResponse.setMessage(teamRequest.getMessage());
                outTeamResponses.add(outTeamResponse);
            }
        }
        return outTeamResponses;
    }


    // lay tat ca nhung doi dang need member

    public List<NeedMemberTeamResponse> getNeedMemberTeams(
            long userId
    ) {


        List<Team> needMemberTeams = teamRepository.findByStatus(TeamStatus.OPEN);
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
            //dang hard code maxTeamMember
            if (team.getMembers().size() >= 5) {
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
                if (member.getStatus() == MemberStatus.OUT) {
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
                if (member.getRole() == MemberRole.LEADER) {
                    memberResponse.setLeader(true);
                } else {
                    memberResponse.setLeader(false);
                }
                needMemberTeamResponse.addMember(memberResponse);

            }
            needMemberTeamResponseList.add(needMemberTeamResponse);
        }
        return needMemberTeamResponseList;
    }

    // get team info
    public TeamInfoResponse getTeamInfo(long userId) {
        Member member = memberRepository.findByMemberIdAndStatusIn(userId, List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE)).orElse(null);
        Team team = member.getTeam();
        if (team == null) {
            throw new IllegalArgumentException("team khong ton tai");
        }
        if (member == null || member.getStatus() == MemberStatus.OUT) {
            throw new IllegalArgumentException("Nguoi dung ko ton tai");
        }
        TeamInfoResponse teamInfoResponse = new TeamInfoResponse();
        teamInfoResponse.setTeamCode(team.getInviteCode());
        teamInfoResponse.setTeamName(team.getName());
        teamInfoResponse.setDescription(team.getDescription());
        teamInfoResponse.setTeamStatus(team.getStatus().toString());
        teamInfoResponse.setTeamRole(member.getRole().toString());
        // set category
        TeamInfoResponse.TrackResponse category = new TeamInfoResponse.TrackResponse();
        category.setId(team.getTrack().getId());
        category.setTrackName(team.getTrack().getName());
        category.setDesc(team.getTrack().getDes());
        category.setCurrentTeams(team.getTrack().getTeamQuantity());
        category.setTeamLimit(team.getTrack().getMaxTeamPerTrack());
        teamInfoResponse.setCategory(category);


        //trả về maxSlots
        Event event = team.getTrack().getEvent();
        teamInfoResponse.setMaxSlots(event.getMaxTeamMember());

        return teamInfoResponse;
    }

    //leader send invitation --> mo rong nhung nguoi da duoc -leader goi
    // invitation roi thi khong hien len

    public String leaderSendInvitation(InvitationRequest invitationRequest, long senderId) {
        User leader = userRepository.findById(senderId).orElse(null);
        if (leader == null) {
            return "sender ko ton tai";
        }
        if (!leader.isActive() || leader.getStatus() != UserStatus.ACCEPTED) {
            return "Leader chưa đủ điều kiện gửi lời mời";
        }
        User recevier = userRepository.findById(invitationRequest.getId()).orElse(null);
        if (!recevier.isActive() || recevier.getStatus() != UserStatus.ACCEPTED) {
            return "Người nhận chưa được admin duyệt";
        }
        Team team = teamRepository.findByLeaderId(senderId).orElse(null);
        if (team == null) {
            return "ko tim thay team";
        }
        TeamRequest teamRequest = new TeamRequest(RequestStatus.PENDING, leader, recevier, team, RequestType.INVITATION, invitationRequest.getMessage());
        teamRequestRepository.save(teamRequest);
        return "invitation thành công";
    }


    //check team name trong luc createTeam xem co bi trung k
    // neu findTeamByLaederId nay da ton tai 1 team roi thi tra ve true luon de tan dung lam edit Team
    public boolean checkName(String name, long leaderId) {
        Team team1 = teamRepository.findByLeaderId(leaderId).orElse(null);
        // leader nay da tao team roi nhung muon edit team thi cho phep edit trung lai ten cu~
        if (team1 != null && team1.getName().equals(name)) {
            return true;
        }

        Team team2 = teamRepository.findByNameIgnoreCaseAndStatus(name, TeamStatus.OPEN).orElse(null);
        // neu ten chua ton tai thi return ve true
        if (team2 == null) {
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
        Team team = teamRepository.findByInviteCodeAndStatus(code, TeamStatus.OPEN).orElse(null);
        SearchTeamByCodeResponse searchTeamByCodeResponse = new SearchTeamByCodeResponse();
        if (team == null) {
            searchTeamByCodeResponse.setType("invalid");
            return searchTeamByCodeResponse;
        }
        int memberCount = memberRepository.countByTeamIdAndStatus(team.getId(), MemberStatus.OFFICAL);
        if (team.getStatus() != TeamStatus.OPEN) {
            searchTeamByCodeResponse.setType("invalid");
        } else {
            searchTeamByCodeResponse.setType("found");
        }

        TeamByCodeResponse teamByCodeResponse = new TeamByCodeResponse();
        teamByCodeResponse.setTeamName(team.getName());
        teamByCodeResponse.setDescription(team.getDescription());
        teamByCodeResponse.setMemberCount(memberCount);
        teamByCodeResponse.setMaxSlots(5);

        // add nhung member vo
        List<Member> members = memberRepository.findByTeamIdAndStatus(team.getId(), MemberStatus.OFFICAL);
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

        return searchTeamByCodeResponse;
    }

    // edit team:
    public String editTeam(EdiTeamRequest editTeamRequest, long leaderId) {
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("team khong ton tai");
        }
        if (editTeamRequest.getName().equals(team.getName())) {
            team.setName(editTeamRequest.getName());
            team.setDescription(editTeamRequest.getDescription());
            teamRepository.save(team);
            return "edit team success";
        }

        Team teamTrungTen = teamRepository.findByNameIgnoreCaseAndStatus(editTeamRequest.getName(), TeamStatus.OPEN).orElse(null);
        // ko tim thay team trung ten
        if (teamTrungTen == null) {
            team.setName(editTeamRequest.getName());
            team.setDescription(editTeamRequest.getDescription());
            teamRepository.save(team);
            return "edit team success";
        }
        return "edit team fail";
    }

    @Transactional
    public String lockTeam(long leaderId) {
        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("Leader không tồn tại"));

        if (!leader.isActive()) {
            throw new IllegalArgumentException("Tài khoản chưa xác nhận Gmail");
        }

        if (leader.getStatus() != UserStatus.ACCEPTED) {
            throw new IllegalArgumentException("Tài khoản chưa được admin duyệt");
        }

        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        if (team == null) {
            throw new IllegalArgumentException("team khong ton tai");
        }
        teamRequestRepository.deleteAllByTeamId(team.getId());
        List<Member> members = team.getMembers();
        for (Member member : members) {
            if (member.getStatus() != MemberStatus.OFFICAL) {
                member.setStatus(MemberStatus.OUT);
            }
        }
        team.setStatus(TeamStatus.PENDING_APPROVAL);
        teamRepository.save(team);
        User admin = userRepository.findByEmail("admin@gmail.com").orElse(null);
        if (admin == null) {
            throw new IllegalArgumentException("admin khong ton tai");
        }
        TeamRequest teamRequest = new TeamRequest(RequestStatus.PENDING, team.getLeader(), admin, team, RequestType.TEAM_SUBMISSION, team.getName() + " gui yeu cau xin duyet doi");
        teamRequestRepository.save(teamRequest);
        return "gui yeu cau duyet doi thanh cong";
    }


    // lấy tất cả team trong sự kiện
    public List<RoundTeamResponse> getTeamsInRoundOfEvent(long eventId, long roundId, long currentUserId) {
        // 1. Lấy tất cả các đội thi thuộc về sự kiện (Tìm thông qua cấu trúc quan hệ Track -> Event)
        List<Team> teams = teamRepository.findTeamsByEventId(eventId);
        List<RoundTeamResponse> responseList = new ArrayList<>();

        for (Team team : teams) {
            RoundTeamResponse roundTeamDto = new RoundTeamResponse();
            roundTeamDto.setTeamId(team.getId());
            roundTeamDto.setTeamName(team.getName());
            roundTeamDto.setTeamStatus(team.getStatus().toString());
            roundTeamDto.setTrackName(team.getTrack() != null ? team.getTrack().getName() : "Chưa phân nhánh");
            roundTeamDto.setMemberCount(team.getMembers() != null ? team.getMembers().size() : 0);

            // 2. Tìm bài nộp (Submission) của Đội thi này ứng với Vòng đấu (Round) đang xét
            // (Bạn thay thế Submission bằng tên Entity quản lý bài nộp thực tế trong dự án của bạn nhé)
            Optional<Submission> submissionOpt = submissionRepository.findByTeamIdAndRoundId(team.getId(), roundId);
            if (submissionOpt.isPresent()) {
                Submission sub = submissionOpt.get();
                roundTeamDto.setHasSubmission(true);
                SubmissionContent submissonContent = roundTeamDto.getSubmissionContent();
                submissonContent.setDocumentLink(sub.getDocumentUrl());
                submissonContent.setGithubLink(sub.getGithubUrl());
                submissonContent.setDemoLink(sub.getDemoUrl());
                roundTeamDto.setSubmissionContent(submissonContent);

            } else {
                roundTeamDto.setHasSubmission(false);
            }

            // 3. Map danh sách thành viên sang định dạng TeamMembersResponseDetail DTO của bạn
            List<TeamMembersResponseDetail> memberDTOs = new ArrayList<>();
            if (team.getMembers() != null) {
                memberDTOs = team.getMembers().stream().map(m -> {
                    TeamMembersResponseDetail memberDto = new TeamMembersResponseDetail();
                    memberDto.setId(m.getMember().getId());
                    memberDto.setName(m.getMember().getFullName());
                    memberDto.setEmail(m.getMember().getEmail());
                    memberDto.setSchool(m.getMember().getSchoolName());

                    // Kiểm tra xem thành viên này có trùng với ID Leader của Team hay không
                    memberDto.setLeader(team.getLeader() != null && team.getLeader().getId() == m.getMember().getId());

                    // Kiểm tra xem thành viên này có phải là User đang thực hiện gọi API hay không
                    memberDto.setCurrentUser(m.getMember().getId() == currentUserId);

                    // Check trạng thái dựa trên Enum MemberStatus (OFFICAL) của bạn
                    memberDto.setOffical(m.getStatus() == com.minhtung.hackathon.enums.MemberStatus.OFFICAL);

                    return memberDto;
                }).toList();
            }
            roundTeamDto.setMembers(memberDTOs);

            responseList.add(roundTeamDto);
        }

        return responseList;
    }

    @Transactional
    public List<ViewTeamListRespone> viewTeamByRound(Long roundId) {
        Round round = roundRepository.findById(roundId).orElseThrow(() -> new RuntimeException("khong tim thay round"));
        Long eventId = round.getEvent().getId();
        List<Team> teams = teamRepository.findByEventIdAndStatus(
                eventId, TeamStatus.APPROVED
        );

        return teams.stream()
                .map(team -> {
                    Submission submission =
                            submissionRepository
                                    .findFirstByTeamIdAndRoundIdAndLatestTrue(
                                            team.getId(),
                                            roundId
                                    )
                                    .orElse(null);

                    return mapToTeamResponse(
                            team,
                            submission
                    );
                })
                .toList();
    }

    private ViewTeamListRespone mapToTeamResponse(
            Team team,
            Submission submission
    ) {
        return ViewTeamListRespone.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .teamStatus(team.getStatus().name())
                .leaderId(
                        team.getLeader() != null
                                ? team.getLeader().getId()
                                : null
                )
                .leaderName(
                        team.getLeader() != null
                                ? team.getLeader().getFullName()
                                : null
                )
                .trackId(
                        team.getTrack() != null
                                ? team.getTrack().getId()
                                : null
                )
                .trackName(
                        team.getTrack() != null
                                ? team.getTrack().getName()
                                : null
                )
                .memberCount(
                        team.getMembers() != null
                                ? team.getMembers().size()
                                : 0
                )
                .hassSubmissionn(submission != null)
                .submissionId(
                        submission != null
                                ? submission.getId()
                                : null
                )
                .build();
    }

    // move to offical
    public String moveMemberToOffical(long memberId) {

        Member member = memberRepository.findByIdAndStatus(memberId, MemberStatus.RESERVE).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("member khong ton tai");
        }
        member.setStatus(MemberStatus.OFFICAL);
        memberRepository.save(member);
        return "move to offical sucessfully !";

    }

    // move to reserve
    public String moveMemberToReserve(long memberId) {

        Member member = memberRepository.findByIdAndStatus(memberId, MemberStatus.OFFICAL).orElse(null);
        if (member == null) {
            throw new IllegalArgumentException("member khong ton tai");
        }
        member.setStatus(MemberStatus.RESERVE);
        memberRepository.save(member);
        return "move to offical sucessfully !";

    }


    //update Team Track
    @Transactional
    public String updateTrack(long categoryId, Integer uid) {

        // Kiểm tra category (track) có tồn tại không
        Track track = trackRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hạng mục."));

        // Lấy member theo user
        Member member = memberRepository.findByMemberIdAndStatus(uid, MemberStatus.OFFICAL)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thành viên."));

        // Lấy team của member
        Team team = member.getTeam();
        if (team == null) {
            throw new IllegalArgumentException("Bạn chưa tham gia đội nào.");
        }

        // Nếu chưa có track thì thêm, có rồi thì cập nhật
        team.setTrack(track);

        teamRepository.save(team);

        return "Cập nhật hạng mục thành công.";
    }


    public TeamDetailForMentorDTO getTeamDetail(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("khong tim thay team"));

        List<TeamMemberDTO> members = memberRepository
                .findByTeamIdAndStatus(teamId, MemberStatus.OFFICAL)
                .stream()
                .map(m -> new TeamMemberDTO(
                        m.getId(),
                        m.getMember().getFullName(),
                        m.getRole()
                ))
                .collect(Collectors.toList());

        return TeamDetailForMentorDTO.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .trackName(team.getTrack() != null ? team.getTrack().getName() : null)
                .members(members)
                .build();
    }


    @Transactional
    public List<AdminTeamResponse> getAllTeamForAdmin() {
        List<Team> teams = teamRequestRepository.findAllForAdmin();
        Map<Long, Long> requestIds = teamRequestRepository
                .findByTypeAndStatus(
                        RequestType.TEAM_SUBMISSION,
                        RequestStatus.PENDING
                )
                .stream()
                .collect(Collectors.toMap(
                        request -> request.getTeam().getId(),
                        TeamRequest::getId,
                        (first, ignored) -> first
                ));

        return teams.stream()
                .map(team -> {
                    User leader = team.getLeader();

                    List<AdminTeamMemberDTO> members = team.getMembers()
                            .stream()
                            .map(member -> {
                                User user = member.getMember();

                                return AdminTeamMemberDTO.builder()
                                        .userId(user.getId())
                                        .fullName(user.getFullName())
                                        .email(user.getEmail())
                                        .school(user.getSchoolName())
                                        .role(member.getRole().name())
                                        .memberStatus(member.getStatus().name())
                                        .joinMethod(member.getJoinMethod().name())
                                        .build();
                            })
                            .toList();

                    return AdminTeamResponse.builder()
                            .teamId(team.getId())
                            .teamName(team.getName())
                            .teamStatus(team.getStatus().name())
                            .description(team.getDescription())
                            .leaderId(leader.getId())
                            .leaderName(leader.getFullName())
                            .leaderEmail(leader.getEmail())
                            .memberCount(members.size())
                            .trackId(team.getTrack() != null ? team.getTrack().getId() : null)
                            .trackName(team.getTrack() != null ? team.getTrack().getName() : null)
                            .createdAt(team.getCreateAt().toString())
                            .requestId(requestIds.get(team.getId()))
                            .members(members)
                            .build();
                })
                .toList();

    }

    @Transactional
    public String adminReviewTeamByLongId(Long teamId, String status) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy team"));


        if (team.getStatus() != TeamStatus.PENDING_APPROVAL) {
            throw new RuntimeException("team dang khong o trang thai cho duyet ");

        }
        TeamStatus nextStatus;
        try {
            nextStatus = TeamStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Status chỉ được là APPROVED hoặc REJECTED"
            );
        }

        if (nextStatus != TeamStatus.APPROVED
                && nextStatus != TeamStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Status chỉ được là APPROVED hoặc REJECTED"
            );
        }

        team.setStatus(nextStatus);


        teamRepository.save(team);
        return nextStatus == TeamStatus.APPROVED
                ? "Đã chấp nhận team"
                : "Đã từ chối team";
    }

    @Transactional
    public String reveolekeApporve(Long teamId){
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy team"));

        if(team.getStatus() !=TeamStatus.APPROVED){
            throw new RuntimeException("chỉ có thể thu hồi với những team approve") ;
        }

        team.setStatus(TeamStatus.PENDING_APPROVAL);


        teamRepository.save(team);

        return TeamStatus.PENDING_APPROVAL.name();
    }
}
