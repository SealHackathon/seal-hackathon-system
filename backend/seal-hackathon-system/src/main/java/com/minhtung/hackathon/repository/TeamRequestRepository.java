package com.minhtung.hackathon.repository;


import com.minhtung.hackathon.entity.Member;
import com.minhtung.hackathon.entity.Team;
import com.minhtung.hackathon.entity.TeamRequest;
import com.minhtung.hackathon.enums.RequestStatus;
import com.minhtung.hackathon.enums.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRequestRepository  extends JpaRepository<TeamRequest,Long> {

     //lấy lời mời đang chờ của 1 user (gửi mã xác nhận qua gmail)

     List<TeamRequest> findByReceiverIdAndTypeAndStatus(Long receiverId, RequestType type, RequestStatus status);
     //lay join request dang cho của 1 dôi (leader_xem )
     List<TeamRequest> findByTeamIdAndTypeAndStatus(Long teamId , RequestType type  , RequestStatus status) ;


     //kiem tra da gui request loại nay chưa tránh spam
     boolean existsBySenderIdAndTeamIdAndTypeAndStatus(long senderId , long teamId , RequestType type ,  RequestStatus status);


     List<TeamRequest> findBySenderId(long senderId);


     //Tim Nhung Request Join Team
     List<TeamRequest> findByTypeAndStatusAndTeamId(RequestType type, RequestStatus status, long teamId);

     //Tim Nhung invitation gui den user
     List<TeamRequest> findByTypeAndStatusAndReceiverId(RequestType type, RequestStatus status, long receiverId);


     //leader tim nhung invitation da gui
     List<TeamRequest> findByTypeAndStatusAndSenderId(RequestType type, RequestStatus status, long senderId);

     //tim nhung request co lien quan toi minh

     List<TeamRequest> findBySenderIdOrReceiverId(long senderId, long receiverId);

     //tim boi nguoi gui yeu cau va nguoi nhan yeu cau
     TeamRequest findBySenderIdAndTeamIdAndStatus(long senderId,long teamId,RequestStatus status);

     //tim nhung invitation da gui cho nguoi cu the
     List<TeamRequest> findBySenderIdAndReceiverId(long senderId,long receiverId);

     //tim nhung invitation da nhan tu 1 team
//     TeamRequest findByReceiverIdAndTeamIdAndStatus(long receiverId,long teamId,boolean status);

     Optional<TeamRequest> findBySenderIdAndTeamIdAndTypeAndStatus(long senderId, long teamId, RequestType type,RequestStatus status);
//
     Optional<TeamRequest> findBySenderIdAndReceiverIdAndTypeAndStatus(long senderId, long reiceiverId, RequestType type,RequestStatus status);

     //

     Optional<TeamRequest> findByReceiverIdAndTeamIdAndTypeAndStatus(long receiverId,long teamId, RequestType requestType, RequestStatus requestStatus);

     //
     void deleteAllByTeamId(long teamId);


}
