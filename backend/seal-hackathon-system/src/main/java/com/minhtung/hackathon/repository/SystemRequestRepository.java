package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.SystemRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
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


    List<SystemRequest> findByReceiverIdAndStatus(long receiverId, SystemRequest.RequestStatus status);
    Optional<SystemRequest> findByIdAndReceiverId(long id, long receiverId);

    // Lấy danh sách lời mời Mentor/Judge đã gửi cho 1 Event, chỉ lấy PENDING hoặc ACCEPTED
    // JOIN FETCH receiver để tránh LazyInitializationException khi map sang DTO
    @Query("SELECT sr FROM SystemRequest sr JOIN FETCH sr.receiver " +
            "WHERE sr.referenceType = :referenceType AND sr.referenceId = :referenceId AND sr.type = :type " +
            "AND sr.status IN :statuses")
    List<SystemRequest> findByReferenceTypeAndReferenceIdAndTypeAndStatusInWithReceiver(
            @Param("referenceType") SystemRequest.ReferenceType referenceType,
            @Param("referenceId") long referenceId,
            @Param("type") SystemRequest.RequestType type,
            @Param("statuses") Collection<SystemRequest.RequestStatus> statuses);
}