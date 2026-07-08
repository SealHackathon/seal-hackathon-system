package com.minhtung.hackathon.service;

import com.minhtung.hackathon.dto.request.TrackRequest;
import com.minhtung.hackathon.dto.response.TrackResponse;
import com.minhtung.hackathon.dto.response.ViewTeamListRespone;
import com.minhtung.hackathon.entity.Event;
import com.minhtung.hackathon.entity.Submission;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.Track;
import com.minhtung.hackathon.repository.EventRepository;
import com.minhtung.hackathon.repository.TeamRepository;
import com.minhtung.hackathon.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final TrackRepository trackRepository;
    private final EventRepository eventRepository;
    private final TeamRepository teamRepository ;


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
                        track.getMinTeamPerTrack(),eventId
                ))
                .toList();
    }


    public Track getTrackById(Long id) {
        return trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Track với ID: " + id));
    }

    @Transactional
    public List<TrackResponse> createTracks(TrackRequest request) {
        // 1. Kiểm tra ID Event tổng
        if (request.getEventId() <= 0) {
            throw new RuntimeException("Lỗi: Không tìm thấy ID của Event tổng. Bạn phải hoàn thành Step 1 trước!");
        }

        // 2. Tìm Event trong DB
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Event với ID: " + request.getEventId()));

        // 🔥 LOGIC ĐỒNG BỘ: Xóa sạch các Track cũ thuộc Event này trước khi chèn mới
        // Đảm bảo bạn đã định nghĩa void deleteByEvent(Event event); trong TrackRepository
        trackRepository.deleteByEventId(request.getEventId());

        // 3. Bóc tách mảng "tracks" từ request để map sang Entity và lưu
        if (request.getTracks() != null && !request.getTracks().isEmpty()) {
            List<Track> tracksToSave = request.getTracks().stream()
                    .map(item -> {
                        Track track = new Track();
                        track.setName(item.getName());
                        track.setDes(item.getDes());
                        track.setMinTeamPerTrack(item.getMinTeamPerTrack());
                        track.setMaxTeamPerTrack(item.getMaxTeamPerTrack());
                        track.setEvent(event); // Gắn mối quan hệ 1-N với Event tổng
                        return track;
                    })
                    .toList();

            // 4. Lưu hàng loạt xuống DB
            List<Track> savedTracks = trackRepository.saveAll(tracksToSave);

            // 5. Map kết quả trả về sang Response DTO (nếu cần hiển thị lại ở FE)
            return savedTracks.stream()
                    .map(track -> new TrackResponse(
                            track.getId(),
                            track.getName(),
                            track.getDes(),
                            track.getMinTeamPerTrack(),
                            track.getMaxTeamPerTrack(),
                            event.getId()
                    ))
                    .toList();
        }

        return Collections.emptyList();
    }

    @Transactional
    public void deleteTrack(long id) {
        Track track = getTrackById(id);
        trackRepository.delete(track);
    }

    @Transactional
    public List<ViewTeamListRespone> viewTeamByTrack(Long trackId){
        Track track = trackRepository.findById(trackId).orElseThrow(()-> new RuntimeException("khong tim thay track")) ;
        return teamRepository.findByTrackId(trackId)
                .stream()
                .map(team -> mapToTeamResponse(team, null))
                .toList() ;
    }

    private ViewTeamListRespone mapToTeamResponse(
            Team team,
            Submission submission
    ) {
        return ViewTeamListRespone.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .teamStatus(team.getStatus().name())
                .leaderId(
                        team.getLeader() != null
                                ? team.getLeader().getId()
                                : null
                )
                .leaderName(
                        team.getLeader() != null
                                ? team.getLeader().getFullName()
                                : null
                )
                .trackId(
                        team.getTrack() != null
                                ? team.getTrack().getId()
                                : null
                )
                .trackName(
                        team.getTrack() != null
                                ? team.getTrack().getName()
                                : null
                )
                .memberCount(
                        team.getMembers() != null
                                ? team.getMembers().size()
                                : 0
                )
                .hassSubmissionn(submission != null)
                .submissionId(
                        submission != null
                                ? submission.getId()
                                : null
                )
                .build();
    }
}