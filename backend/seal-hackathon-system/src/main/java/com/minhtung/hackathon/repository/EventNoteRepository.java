package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.EventNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventNoteRepository extends JpaRepository<EventNote, Long> {
    // Tìm tất cả lưu ý của một Event cụ thể
    List<EventNote> findByEventId(long eventId);
    void deleteByEventId(long eventId);

}