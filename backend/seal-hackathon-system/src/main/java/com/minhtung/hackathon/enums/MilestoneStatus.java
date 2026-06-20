package com.minhtung.hackathon.enums;

public enum MilestoneStatus {
    UPCOMING,    // Sắp diễn ra (Hiện tại < dateStart)
    IN_PROGRESS, // Đang diễn ra (dateStart <= Hiện tại <= dateEnd)
    COMPLETED    // Đã kết thúc (Hiện tại > dateEnd)
}