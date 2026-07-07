package com.minhtung.hackathon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventNoteResponse {
    private long id; // ID tự tăng dưới DB sau khi save thành công
    private String title;
    private String description;
    private long eventId; // Chỉ trả về ID phẳng để FE tiện đối chiếu nếu cần

    public EventNoteResponse(long id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
    }
}