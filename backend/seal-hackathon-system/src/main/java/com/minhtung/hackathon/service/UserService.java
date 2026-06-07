package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.SearchMemberResponse;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.TeamRequest;
import com.minhtung.hackathon.entity.User;
import com.minhtung.hackathon.enums.RequestStatus;
import com.minhtung.hackathon.enums.RequestType;
import com.minhtung.hackathon.enums.Role;
import com.minhtung.hackathon.repository.MemberRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.TeamRequestRepository;
import com.minhtung.hackathon.repository.UserRepository;
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

    //ham get nhung user chua co team
    //những ai đã có request tới team hoặc đã đc team invitation thì ko get
    public List<SearchMemberResponse> getMemberNoTeam(long leaderId) {
        List<User> freeUsers = userRepository.findUsersWithoutTeam(Role.USER);
        Team team = teamRepository.findByLeaderId(leaderId).orElse(null);
        int memberCount = memberRepository.countByTeamIdAndStatus(team.getId(), true);
        if (memberCount == 4) {
            return Collections.emptyList();
        }
        if (team == null) {
            return Collections.emptyList();
        }
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
            SearchMemberResponse response = new SearchMemberResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setDescription("Discruption Dang Hard Code Them Sau");
            response.setName(user.getFullName());
            response.setSchoolName(user.getSchoolName());
            members.add(response);
        }
        return members;
    }

}
