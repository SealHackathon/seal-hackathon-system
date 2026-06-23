package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.SystemRequest;
import com.minhtung.hackathon.entity.SystemRequest.ReferenceType;
import com.minhtung.hackathon.enums.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemRequestRepository extends JpaRepository<SystemRequest, Long> {
    void deleteByReferenceIdAndReferenceType(long referenceId, ReferenceType referenceType);

    Optional<SystemRequest> findByReceiver_IdAndReferenceIdAndType(
            long receiverId,
            long referenceId,
            SystemRequest.RequestType type
    );


}