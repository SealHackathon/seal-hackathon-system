package com.minhtung.hackathon.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventNoteResponse {
    private long id;
    private String title;
    private String description;
}