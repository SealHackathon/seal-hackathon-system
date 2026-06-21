package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.TrackRequest;
import com.minhtung.hackathon.dto.response.TrackResponse;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Track;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final TrackRepository trackRepository;
    private final EventRepository eventRepository;


    // Lấy tất cả danh sách bảng đấu (Track) thuộc về một sự kiện cụ thể
    public List<TrackResponse> getTracksByEventId(long eventId) {
        // 1. Kiểm tra Event có tồn tại không trước khi lấy track
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Không tìm thấy Event với ID: " + eventId);
        }

        // 2. Tìm danh sách Track từ Repo
        List<Track> tracks = trackRepository.findByEventId(eventId);

        // 3. Map danh sách Entity sang DTO phẳng để trả về cho Controller (tránh lỗi lặp vô hạn)
        return tracks.stream()
                .map(track -> new TrackResponse(
                        track.getId(),
                        track.getName(),
                        track.getDes(), // Biến mô tả trong Entity của bạn
                        track.getMaxTeamPerTrack(),
                        track.getMinTeamPerTrack()
                ))
                .toList();
    }


    public Track getTrackById(Long id) {
        return trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Track với ID: " + id));
    }

    @Transactional
    public long createTrack(TrackRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        // Vì Entity Track không có constructor mặc định trống (chỉ có constructor 4 tham số),
        // Ta sử dụng constructor đó rồi set Event sau, hoặc bạn có thể bổ sung @NoArgsConstructor vào Entity Track.
        Track track = new Track(
                request.getName(),
                request.getDes(),
                request.getMaxTeamPerTrack(),
                request.getMinTeamPerTrack()
        );
        track.setEvent(event);

        trackRepository.save(track);
        return track.getId();
    }


    @Transactional
    public void deleteTrack(long id) {
        Track track = getTrackById(id);
        trackRepository.delete(track);
    }
}