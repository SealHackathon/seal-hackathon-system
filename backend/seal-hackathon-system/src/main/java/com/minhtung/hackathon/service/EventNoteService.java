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
import java.util.Collections;
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
        // 1. Kiểm tra xem có eventId tổng truyền xuống chưa


        // 2. Tìm kiếm Event cũ trong DB để cập nhật
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        // Cập nhật lại luật (Rules) cho Event tổng
        event.setRules(request.getEventRules());
        eventRepository.save(event); // Cập nhật Event trước

        // 3. LOGIC QUAN TRỌNG: Nếu là UPDATE, xóa toàn bộ các Note cũ thuộc Event này trước khi chèn mới
        // Giả sử trong eventNoteRepository bạn có hàm: deleteByEventId(Long eventId) hoặc deleteByEvent(Event event)
        eventNoteRepository.deleteByEventId(request.getEventId());

        // 4. Bóc tách mảng "notes" từ Frontend gửi xuống và map sang Entity mới hoàn toàn
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            List<EventNote> notesToSave = request.getNotes().stream()
                    .map(item -> new EventNote(
                            item.getTitle(),
                            item.getDesc(),
                            event // Gán liên kết với Event chung
                    ))
                    .toList();

            // 5. Lưu tập hợp các Note mới xuống DB
            List<EventNote> savedNotes = eventNoteRepository.saveAll(notesToSave);

            // 6. Map dữ liệu sang Response DTO trả về cho Frontend
            return savedNotes.stream()
                    .map(note -> new EventNoteResponse(
                            note.getId(),          // ID mới vừa sinh tự động
                            note.getTitle(),
                            note.getDescription(),
                            event.getId()
                    ))
                    .toList();
        }

        // Nếu mảng notes gửi xuống rỗng, trả về list rỗng
        return Collections.emptyList();
    }
}