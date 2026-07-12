package com.minhtung.hackathon.repository; // Thay đổi package phù hợp với project của bạn

import com.minhtung.hackathon.entity.RoundTrack; // Thay đổi theo thực thể RoundTrack của bạn
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundTrackRepository extends JpaRepository<RoundTrack, RoundTrack.RoundTrackId> {
    // JpaRepository đã tự động cung cấp hàm findById(RoundTrackId id) 
    // dùng để tìm kiếm theo cả cặp roundId và trackId cực kỳ tiện lợi.
}