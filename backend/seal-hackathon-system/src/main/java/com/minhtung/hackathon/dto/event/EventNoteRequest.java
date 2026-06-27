package com.minhtung.hackathon.dto.event;

import lombok.Data;
import java.util.List;

@Data
public class EventNoteRequest {
    private long eventId; // ID chung nằm ở ngoài mảng
    private String eventRules;
    private List<NoteItem> notes; // Mảng các lưu ý

    @Data
    public static class NoteItem {
        private Long id; // ID của từng dòng note cụ thể (có thể trống ở lần đầu)
        private String title;
        private String desc;
    }
}