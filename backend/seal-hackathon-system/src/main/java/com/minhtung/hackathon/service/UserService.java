package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.LecturerResponse;
import com.minhtung.hackathon.dto.response.SearchMemberResponse;
import com.minhtung.hackathon.entity.Student_profile;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.TeamRequest;
import com.minhtung.hackathon.entity.User;
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
    private final StudentprofileRepository  studentprofileRepository;
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
            Student_profile profile=studentprofileRepository.findByUserId(user.getId()).orElse(null);

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

}
