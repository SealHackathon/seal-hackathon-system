package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.enums.EventStatus;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class EventRequest {
    private Long id; // Thêm trường này để biết khi nào cần updatel
    private String name;
    private String description;
    private String descriptionDetails;
    private int minTeamMember;
    private int maxTeamMember;
    private String topic;
    private String rules;
    private String eventLocation;
    private String participationBenefits;
    private String keywords;
    // Cấu hình định dạng đón nhận chuỗi thời gian từ Form-data
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime openRegisterTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime closeRegisterTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime cofirmTeamTime;

    // File ảnh từ client
    private MultipartFile bannerFile;
    private MultipartFile thumbnailFile;

    private String bannerImg;
    private String thumbnail_image;
}