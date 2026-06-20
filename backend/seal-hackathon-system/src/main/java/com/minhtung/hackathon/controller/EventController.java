package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.dto.event.AllEventResponse;
import com.minhtung.hackathon.dto.event.EventDetailsResponse;
import com.minhtung.hackathon.dto.event.EventRequest;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.repository.UserRepository;
import com.minhtung.hackathon.security.JwtUtil;
import com.minhtung.hackathon.service.EventService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event")
@RequiredArgsConstructor
@Tag(name = "Template")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")


public class EventController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EventService eventService;

    // api admin view full event
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> getEvent(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // api admin view Live
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/live")
    public ResponseEntity<?> getLiveEvent(@RequestHeader("Authorization") String auth) {
        Integer uid = getUid(auth);
        if (uid == null) {

            return unauthorized();
        }
        try {
            return ResponseEntity.ok(eventService.getLiveEvent());
        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }

    }

    // 3. CREATE  DRAFT- Tạo mới một event
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    public ResponseEntity<?> createEvent(@RequestHeader("Authorization") String auth, @RequestBody EventRequest request) {
        if (getUid(auth) == null) return unauthorized();
        try {
            return ResponseEntity.status(201).body(eventService.createEvent(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo event: " + e.getMessage());
        }
    }

    //admin xoa 1 event
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@RequestHeader("Authorization") String auth, @PathVariable long id) {
        if (getUid(auth) == null) return unauthorized();
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok("Xóa thành công event có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }


    // Endpoint lấy chi tiết 1 Event theo ID (bao gồm cả Prizes và Coming Round)
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventDetailsById(@PathVariable long id) {
        try {
            EventDetailsResponse eventDetails = eventService.getEventDetailsById(id);
            return ResponseEntity.ok(eventDetails);
        } catch (IllegalArgumentException e) {
            // Trả về 404 Not Found kèm câu báo lỗi nếu không tìm thấy Event ID đó
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            // Trả về 400 Bad Request cho các lỗi hệ thống phát sinh khác
            return ResponseEntity.badRequest().body("Lỗi khi lấy chi tiết sự kiện: " + e.getMessage());
        }
    }

    private Integer getUid(String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email)
                    .map(u -> Math.toIntExact(u.getId()))
                    .orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity.status(401).body("Token không hợp lệ");
    }


}
