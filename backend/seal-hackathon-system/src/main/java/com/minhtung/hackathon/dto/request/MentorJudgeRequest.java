package com.minhtung.hackathon.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class MentorJudgeRequest {
    private long eventId;
    private List<MentorItem> mentors;
    private List<JudgeItem> judges;

    @Data
    public static class MentorItem {
        private long userId;
        private Long trackId;       // nullable — chưa assign hạng mục
    }

    @Data
    public static class JudgeItem {
        private long userId;
        private List<Long> trackIds;  // nhiều hạng mục
        private List<Long> roundIds;  // nhiều vòng (FE có roundIds)
    }
}