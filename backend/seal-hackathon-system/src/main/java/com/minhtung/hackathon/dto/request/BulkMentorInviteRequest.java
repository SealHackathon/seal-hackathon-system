        package com.minhtung.hackathon.dto.request;
        import lombok.Data;
        import java.util.List;

        @Data
        public class BulkMentorInviteRequest {
            private long eventId;
            private long trackId;
            private List<Long> ids; // Danh sách các userId cần gửi invite
        }