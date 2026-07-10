package com.minhtung.hackathon.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SubmissionDetailResponseid {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long roundId;
    private String roundName;
    private Long scoringTemplateId;

    private String githubUrl;
    private String demoUrl;
    private String documentUrl;

    private LocalDateTime submittedAt;
    private boolean latest;

    private List<MemberResponse> members;

    //  THÊM CÁC TRƯỜNG PHỤC VỤ FETCH ĐIỂM CŨ LÊN FRONTEND
    private String scoringStatus;       // Trạng thái chấm: "DRAFT", "SUBMITTED" (hoặc null nếu chưa chấm)
    private Double finalScore;          // Tổng điểm tổng kết (totalScore) đã chấm
    private String overallComment;      // Nhận xét tổng quan của Giám khảo (comment)
    private LocalDateTime scoredAt;     // Thời gian chấm/cập nhật điểm gần nhất

    // Map chứa điểm chi tiết: Key = criterionId (dạng String/Long), Value = điểm số tương ứng
    // Ví dụ: { "1": 8.5, "2": 7.0 }
    private Map<String, Double> scores;

    // Map chứa nhận xét chi tiết từng tiêu chí: Key = criterionId, Value = lời nhắn
    // Ví dụ: { "1": "Ý tưởng tốt", "2": "Cần hoàn thiện code" }
    private Map<String, String> notes;

    @Data
    @Builder
    public static class MemberResponse {
        private Long id;
        private String fullName;
        private String roleInTeam;
        private boolean isLeader;
    }
}