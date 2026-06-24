package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.SystemRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.Optional;

public interface SystemRequestRepository extends JpaRepository<SystemRequest, Long> {

    // Check trùng lời mời Mentor (Theo Receiver, Event, Track và Status)
    Optional<SystemRequest> findByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatus(
            long receiverId, long referenceId, long trackId, SystemRequest.RequestType type, SystemRequest.RequestStatus status);

    // Check trùng lời mời Judge (Theo Receiver, Event, Track, Round và Status)
    Optional<SystemRequest> findByReceiver_IdAndReferenceIdAndTrackIdAndRoundIdAndTypeAndStatus(
            long receiverId, long referenceId, long trackId, long roundId, SystemRequest.RequestType type, SystemRequest.RequestStatus status);

    // Dùng cho hàm helper check chéo Business Rule (Quét các trạng thái PENDING, ACCEPTED)
    boolean existsByReceiver_IdAndReferenceIdAndTrackIdAndTypeAndStatusIn(
            long receiverId, long referenceId, long trackId, SystemRequest.RequestType type, Collection<SystemRequest.RequestStatus> statuses);
}