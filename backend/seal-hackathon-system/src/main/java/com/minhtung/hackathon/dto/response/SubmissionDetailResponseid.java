package com.minhtung.hackathon.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SubmissionDetailResponseid {
    private Long id ;
    private Long teamId ;
    private String teamName ;
    private Long roundId ;
    private String roundName;
    private Long scoringTemplateId;

    private String githubUrl;
    private String demoUrl;
    private String documentUrl;

    private LocalDateTime submittedAt;
    private boolean latest;

    private List<MemberResponse> members;
    @Data
    @Builder
    public static class MemberResponse {
        private Long id;
        private String fullName;
        private String roleInTeam; // Vị trí trong đội (Ví dụ: Developer, Designer...)
        private boolean isLeader;  // Có phải trưởng nhóm không
    }

}
