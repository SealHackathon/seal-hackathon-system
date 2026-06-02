package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.response.SearchMemberResponse;
import com.minhtung.hackathon.entity.User;
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
    public List<SearchMemberResponse> getMemberNoTeam() {
        List<User> freeUsers = userRepository.findUsersWithoutTeam(Role.USER);
        if (freeUsers.isEmpty()) {
            return Collections.emptyList();
        }
        List<SearchMemberResponse> members = new ArrayList<>();
        for (User user : freeUsers) {
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
