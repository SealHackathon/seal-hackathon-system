package com.minhtung.hackathon.entity;


import com.minhtung.hackathon.enums.RequestStatus;
import com.minhtung.hackathon.enums.RequestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "TeamRequest")
public class TeamRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 20, nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    @Column(name = "SenderId", nullable = false)
    private long senderId;
    @Column(name = "ReceiverID", nullable = false)
    private Long receiverId;

    @Column(name = "TeamId", nullable = false)
    private Long teamId;
    //JOIN_REQUEST , INVATION ,  LEAVE_REQUEST, TEAM_SUBMISSION
    @Enumerated(EnumType.STRING)
    @Column(name = "Type", length = 255, nullable = false)
    private RequestType type;
    @Column(name = "message")
    private String message;


    public TeamRequest(long senderId, long receiverId, long teamId, RequestType type,String message) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.teamId = teamId;
        this.type = type;
        this.message = message;
    }


}
