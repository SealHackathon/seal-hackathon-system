package com.minhtung.hackathon.enums;

public enum AuditAction {
    CREATE,
    UPDATE,
    DELETE,

    SUBMIT,
    RESUBMIT,

    SCORE,
    UPDATE_SCORE,

    PROMOTE,
    ELIMINATE,

    ASSIGN,
    UNASSIGN,

    APPROVE,
    REJECT,
    SCORE_SUBMITTED, // Lần đầu chấm xong và nộp
    SCORE_EDITED     // Chỉnh sửa điểm sau khi được Admin duyệt FIXING
    ,FLAGGED
}