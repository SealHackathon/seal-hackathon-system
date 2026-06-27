package com.minhtung.hackathon.controller;

import com.minhtung.hackathon.dto.event.EventNoteRequest;
import com.minhtung.hackathon.dto.response.EventNoteResponse;
import com.minhtung.hackathon.entity.EventNote;
import com.minhtung.hackathon.service.EventNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-notes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class EventNoteController {

    private final EventNoteService eventNoteService;

    //get Event Note By Event Id
    @GetMapping
    public ResponseEntity<List<EventNoteResponse>> getEventNotes(@RequestParam long eventId) {
        return ResponseEntity.ok(eventNoteService.getEventNotesByEventId(eventId));
    }



    // API nhận Object Request chứa eventId và mảng lồng bên trong
    @PostMapping
    public ResponseEntity<List<EventNoteResponse>> createNotes(@RequestBody EventNoteRequest request) {
        List<EventNoteResponse> savedNotes = eventNoteService.createNotes(request);
        return ResponseEntity.ok(savedNotes);
    }
}