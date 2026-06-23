package com.minhtung.hackathon.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class BulkInviteRequest {
    private long eventId;
    private List<Long> ids; // Danh sách các userId cần gửi invite
}