package com.minhtung.hackathon.dto.event;

import com.minhtung.hackathon.dto.response.*;
import com.minhtung.hackathon.dto.round.RoundDetailsResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventDetailsResponse {
    private long eventId;
    private String eventName;
    private String eventTopic;
    private String description;
    private String descriptionDetails;
    private String eventLocation;
    private String bannerImg;
    private String thumbnailImage;
    private String rules;
    private String participationBenefits;
    private int minTeamMember;
    private int maxTeamMember;
    private String eventStatus;
    private LocalDateTime createAt;
    private LocalDateTime openRegisterTime;
    private LocalDateTime closeRegisterTime;
    private LocalDateTime cofirmTeamTime;

    // Thống kê số lượng số
    private int trackQuantity;
    private int roundQuantity;
    private int teamQuantity;
    private int candidateQuantity;


    private List<PrizeResponse> prizes;                  // Thay thế biến long prize cũ

    // Chi tiết danh sách hiển thị kèm theo
    private List<TrackResponse> tracks;
    private List<RoundDetailsResponse> rounds;

    private List<EventNoteResponse> notes;
    // List milestone
    private List<MilestoneResponse> milestones;
    private List<MentorInviteDto> mentors;
    private List<JudgeInviteDto> judges;

}