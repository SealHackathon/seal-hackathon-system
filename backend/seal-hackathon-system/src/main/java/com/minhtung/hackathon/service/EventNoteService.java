package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.event.EventNoteRequest;
import com.minhtung.hackathon.dto.response.EventNoteResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.EventNote;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.EventNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventNoteService {

    private final EventNoteRepository eventNoteRepository;
    private final EventRepository eventRepository;

    public List<EventNoteResponse> getEventNotesByEventId(long eventId) {
        // 1. Kiểm tra xem Event có tồn tại không
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Không tìm thấy Event với ID: " + eventId);
        }

        // 2. Lấy danh sách từ repo
        List<EventNote> notes = eventNoteRepository.findByEventId(eventId);

        // 3. Nếu rỗng thì trả về mảng trống luôn cho an toàn
        if (notes == null || notes.isEmpty()) {
            return new ArrayList<>();
        }

        // 4. Map sang DTO sạch
        return notes.stream()
                .map(note -> new EventNoteResponse(
                        note.getId(),
                        note.getTitle(),
                        note.getDescription()
                ))
                .toList();
    }



    @Transactional
    public List<EventNoteResponse> createNotes(EventNoteRequest request) {
        // 1. Lấy eventId ở ngoài cùng để tìm Event trong DB (chỉ tìm 1 lần)
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        event.setRules(request.getEventRules());

        // 2. Bóc tách mảng "notes" bên trong DTO để map sang mảng Entity
        List<EventNote> notesToSave = request.getNotes().stream()
                .map(item -> new EventNote(
                        item.getTitle(),
                        item.getDescription(),
                        event // Gán cùng 1 event chung cho tất cả các note trong mảng
                ))
                .toList();

        // 3. Lưu toàn bộ danh sách xuống DB (Lúc này các object bên trong notesToSave sẽ được gắn ID thực tế)
        List<EventNote> savedNotes = eventNoteRepository.saveAll(notesToSave);

        eventRepository.save(event);
        // 4. MAP SANG RESPONSE: Chuyển đổi danh sách đã lưu thành DTO để trả về cho Front-end
        return savedNotes.stream()
                .map(note -> new EventNoteResponse(
                        note.getId(),          // ID vừa được DB sinh tự động
                        note.getTitle(),
                        note.getDescription(),
                        event.getId()          // ID phẳng của event
                ))
                .toList();
    }
}