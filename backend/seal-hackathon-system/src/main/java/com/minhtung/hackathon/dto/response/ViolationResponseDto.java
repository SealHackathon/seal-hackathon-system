package com.minhtung.hackathon.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationResponseDto {

    private Long id;              // ID của SystemRequest
    private Long submissionId;    // ID bài nộp bị cắm cờ
    private String teamName;      // Tên đội thi
    private String round;         // Tên vòng thi (vd: "Vòng sơ loại")
    private String judgeName;     // Tên giám khảo báo cáo
    
    @JsonFormat(pattern = "HH:mm dd/MM/yyyy")
    private LocalDateTime time;   // Thời gian gửi báo cáo
    
    private String reason;        // Lý do vi phạm (message)
}