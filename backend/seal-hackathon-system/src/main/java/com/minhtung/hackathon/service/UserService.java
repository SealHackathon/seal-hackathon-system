package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.entity.*;
import com.minhtung.hackathon.enums.*;
import com.minhtung.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final UserRepository userRepository;
    private final StudentprofileRepository studentprofileRepository;
    private final UserIdentityProfileRepository userIdentityProfileRepository;

    //ham get nhung user chua co team
    //những ai đã có request tới team hoặc đã đc team invitation thì ko get
    public List<SearchMemberResponse> getMemberNoTeam(long leaderId) {
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
//        int memberCount = memberRepository.countByTeamIdAndStatus(team.getId(), true);
        if (team.getStatus() != TeamStatus.OPEN) {
            return Collections.emptyList();
        }
        if (team == null) {
            return Collections.emptyList();
        }

        List<User> freeUsers = userRepository.findUsersWithoutTeam(
                Role.USER,
                team.getId(),
                MemberStatus.OFFICAL,
                MemberStatus.OUT
        );

        if (freeUsers.isEmpty()) {
            return Collections.emptyList();
        }

        List<SearchMemberResponse> members = new ArrayList<>();
        for (User user : freeUsers) {
            TeamRequest invitation = teamRequestRepository.findByReceiverIdAndTeamIdAndTypeAndStatus(user.getId(), team.getId(), RequestType.INVITATION, RequestStatus.PENDING).orElse(null);

            TeamRequest joinRequest = teamRequestRepository.findBySenderIdAndTeamIdAndTypeAndStatus(user.getId(), team.getId(), RequestType.JOIN_REQUEST, RequestStatus.PENDING).orElse(null);
            if (joinRequest != null || invitation != null) {
                continue;
            }
            Student_profile profile = studentprofileRepository.findByUserId(user.getId()).orElse(null);

            SearchMemberResponse response = new SearchMemberResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setDescription("Discruption Dang Hard Code Them Sau");
            response.setName(user.getFullName());
            response.setSchoolName(user.getSchoolName());
            if (profile != null) {
                response.setPositions(profile.getPositions());
                response.setTechTags(profile.getTechTags());
                response.setTopics(profile.getTopics());
                response.setCvLink(profile.getCvLink());
                response.setStudent_info_bio(profile.getBio());
            }

            members.add(response);
        }
        return members;
    }

    public List<LecturerResponse> getLecturers(String query) {
        List<User> users = (query == null || query.isBlank())
                ? userRepository.findByRole(Role.LECTURER)
                : userRepository.findByRoleAndFullNameContainingIgnoreCase(Role.LECTURER, query);

        return users.stream()
                .map(u -> new LecturerResponse(u.getId(), u.getFullName(), u.getTitle(), u.getOrg()))
                .toList();
    }


    // get user status

    public String getUserStatus(long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getStatus().toString();
    }


    // get user information LIST

    public List<UserInformationResponse> getUserInfor() {
        // 1. Lấy tất cả user từ database
        List<User> users = userRepository.findAll();
        List<UserInformationResponse> responseList = new ArrayList<>();

        for (User user : users) {
            UserInformationResponse response = new UserInformationResponse();
            response.setUserId(user.getId());
//            response.setRegisteredDate(user.get); // TODO làm thêm cái field registeredDate
            response.setFullName(user.getFullName());
            response.setSchoolName(user.getSchoolName());
            response.setEmail(user.getEmail());
            response.setPhoneNumber(String.valueOf(user.getPhoneNumber()));
            response.setMssv(user.getStudentId());
            response.setAccountRole(user.getRole() != null ? user.getRole().toString() : null);
            response.setAccoutStatus(user.getStatus() != null ? user.getStatus().toString() : null);

            // 2. Tìm thông tin Member
            Member member = memberRepository.findByMemberIdAndStatusIn(
                    user.getId(),
                    List.of(MemberStatus.OFFICAL, MemberStatus.RESERVE)
            ).orElse(null);

            if (member != null) {
                response.setTeamRole(member.getRole() != null ? member.getRole().toString() : "NO_TEAM");
                response.setTeamName(member.getTeam() != null ? member.getTeam().getName() : "NO_TEAM");
            } else {
                response.setTeamRole("NO_TEAM");
                response.setTeamName("NO_TEAM");
            }

            // 3. Tìm thông tin Identity Profile và set vào response (Đoạn này code cũ của bạn đang bị thiếu)
            UserIdentityProfile profile = userIdentityProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                UserIdentityProfileResponse userIdentityProfileResponse = new UserIdentityProfileResponse();
                userIdentityProfileResponse.setId(profile.getId());
                userIdentityProfileResponse.setFullName(profile.getFullName());
                userIdentityProfileResponse.setCmnd(profile.getCmnd());
                userIdentityProfileResponse.setDateOfBirth(profile.getDateOfBirth());
                userIdentityProfileResponse.setGender(profile.getGender());
                userIdentityProfileResponse.setHometown(profile.getHometown());
                userIdentityProfileResponse.setThuongtru(profile.getThuongtru());
                userIdentityProfileResponse.setFrontcmnd_img(profile.getFrontcmnd_img());
                userIdentityProfileResponse.setCmndBack_img(profile.getCmndBack_image());

                // LƯU Ý: Bạn cần bổ sung hàm setProfile này trong class UserInformationResponse nếu chưa có
                response.setUserIdentityProfileResponse(userIdentityProfileResponse);
            }

            // 4. Tìm thông tin Student Profile
            Student_profile studentProfile = studentprofileRepository.findByUserId(user.getId()).orElse(null);
            if (studentProfile != null) {
                response.setStudenntCardImg(studentProfile.getImg_studentcard());
            }

            // Thêm response của user hiện tại vào list kết quả
            responseList.add(response);
        }

        return responseList;
    }



}
