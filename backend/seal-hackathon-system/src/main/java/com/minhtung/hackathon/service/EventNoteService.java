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
import java.util.Objects;

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
        // 1. Tìm và cập nhật Rules cho Event tổng trước
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));
        event.setRules(request.getEventRules());
        eventRepository.saveAndFlush(event); // Lưu và ép đẩy xuống DB ngay

        // 2. NGẮT KẾT NỐI: Xóa sạch danh sách trong bộ nhớ cache của đối tượng Event này
        if (event.getNotes() != null) {
            event.getNotes().clear();
        }

        // 3. ÉP XÓA TRỰC TIẾP: Dùng Repo xóa thẳng các Note cũ của Event này dưới DB
        eventNoteRepository.deleteByEventId(request.getEventId());
        eventNoteRepository.flush(); // Ép lệnh DELETE chạy ngay lập tức, dọn sạch DB

        // 4. THÊM MỚI CO LẬP: Lưu danh sách mới hoàn toàn bằng Repo con
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            List<EventNote> newNotes = request.getNotes().stream()
                    .map(item -> new EventNote(
                            item.getTitle(),
                            item.getDesc(),
                            event // Chỉ mượn đối tượng event làm Khóa Ngoại (Foreign Key)
                    ))
                    .toList();

            // Lưu thẳng qua Repo con, không liên quan gì tới đống bùi nhùi Cascade của Event cha
            List<EventNote> savedNotes = eventNoteRepository.saveAll(newNotes);
            eventNoteRepository.flush();

            // 5. Trả về danh sách chuẩn kèm ID tự tăng mới tinh từ DB
            return savedNotes.stream()
                    .map(note -> new EventNoteResponse(
                            note.getId(),
                            note.getTitle(),
                            note.getDescription(),
                            event.getId()
                    ))
                    .toList();
        }

        return Collections.emptyList();
    }

}