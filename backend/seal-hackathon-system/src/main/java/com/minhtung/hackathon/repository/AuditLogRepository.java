package com.minhtung.hackathon.repository;

import com.minhtung.hackathon.entity.AuditLog;
import com.minhtung.hackathon.entity.Award;
import com.minhtung.hackathon.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Tìm tất cả giải thưởng thuộc Round, có thể lọc theo Track nếu cần
// Đếm số lượng theo Action
    long countByAction(AuditAction action);

    // Lấy danh sách audit log phân trang theo thứ tự mới nhất
    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    // Thêm phương thức xóa log cắm cờ
    void deleteByEntityTypeAndEntityIdAndPerformedByIdAndAction(
            String entityType,
            Long entityId,
            Long performedById,
            AuditAction action
    );
}