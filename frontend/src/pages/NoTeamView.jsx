import { useState } from 'react'
import EventLayout from '../layouts/EventLayout'
import NoTeamHeader from '../components/noTeamView/NoTeamHeader'
import FindTeamSection from '../components/noTeamView/FindTeamSection'
import InviteTeamCard from '../components/noTeamView/InviteTeamCard'
import RequestTeamCard from '../components/noTeamView/RequestTeamCard'
// import JoinTeamFlow from '../components/joinFlow/JoinTeamFlow'
import styles from './LeaderView.module.css'
import { useEffect } from 'react'
import axios from 'axios'
import axiosClient from '../api/axiosClient'
import CreateTeamStep from '../components/joinFlow/CreateTeamStep'
import JoinByCodeStep from '../components/joinFlow/JoinByCodeStep'
import ConfirmModal from '../components/shared/ConfirmModal'

// import { data } from 'react-router-dom'

function NoTeamView() {

  const [teamStatus, setTeamStatus] = useState('pending')
  const token = localStorage.getItem("accessToken");
  const [FAKE_INVITES, setFAKE_INVITES] = useState([]);
  const [FAKE_REQUESTS, setFAKE_REQUESTS] = useState([]);
  const [FAKE_TEAMS, setFAKE_TEAMS] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null)

  // Modal thông báo bị kick
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [showApprovedLeaveModal, setShowApprovedLeaveModal] = useState(false);

  useEffect(() => {
    const wasInTeam = localStorage.getItem('lastKnownTeamRole') === 'IN_TEAM';
    const hadPendingLeave = localStorage.getItem('pendingLeaveRequest') === 'true';

    if (wasInTeam) {
      if (hadPendingLeave) {
        setShowApprovedLeaveModal(true);
      } else {
        setShowKickedModal(true);
      }
      localStorage.removeItem('lastKnownTeamRole');
      localStorage.removeItem('pendingLeaveRequest');
    }
  }, []);

  const handleCloseKickedModal = () => {
    setShowKickedModal(false);
  };

  // api sinh vien xem những invitation gui toi minh
  useEffect(() => {
    axiosClient.get('/teamrequest/member-invitation')
      .then((response) => {
        setFAKE_INVITES(response.data);

      })
      .catch((error) => console.log(error));
  }, []);


  useEffect(() => {
    axiosClient
      .get('/team/needing-members'
      )
      .then((response) => {
        const teams = response.data.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          maxSlots: 4,
          members: team.members.map(m => ({
            id: m.id,
            name: m.name,
            school: m.school,
            isLeader: m.isLeader
          })),
          isRequested: false, // mặc định chưa gửi request tham gia
        }))
        setFAKE_TEAMS(teams);
      })
      .catch((error) => console.log(error));
  }, []);




  //
  // api sinh vien xem những request da gui di
  useEffect(() => {
    axiosClient
      .get('/teamrequest/member-request'
      )
      .then((response) => {
        setFAKE_REQUESTS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);


  // api sinh vien accept invitation
  const userHandleInvitation = (requestId, isAccepted) => {
    axiosClient
      .put('/teamrequest/invitation-response', {
        requestId: requestId,
        accept: isAccepted
      })
      .then((response) => {
        console.log(response.data);
        setFAKE_INVITES(response.data)
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra khi chấp nhận lời mời!");
      });
  }



  // api sinh vien huy request da gui di

  const handleCancel = ((requestId) => {
    //  Hiển thị hộp thoại xác nhận trước khi gửi yêu cầu hủy/xóa
    setConfirmModal({
      title: 'Hủy lời mời',
      message: 'Bạn có chắc chắn muốn hủy lời mời này không?',
      confirmLabel: 'Xác nhận',
      onConfirm: () => {
        axiosClient
          .delete('/teamrequest/request',{})
          .then((response) => {
            console.log(response.data);

            // Hiện thông báo thành công cho người dùng biết
            // alert("Đã hủy lời mời thành công!");

            //  Tải lại trang để cập nhật giao diện (mất lời mời vừa hủy)
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi hủy lời mời!");
          });
        setConfirmModal(null)
      }
    })
  });

  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinByCode, setShowJoinByCode] = useState(false)
  const [emailStatus, setEmailStatus] = useState('default')
  const [emailMessage, setEmailMessage] = useState('')

  console.log(FAKE_INVITES)

  return (
    <EventLayout>
      <div className={styles.page}>

        <NoTeamHeader onCreateTeam={() => setShowCreateTeam(true)} onEnterCode={() => setShowJoinByCode(true)} />

        <div className={styles.content}>

          <div className={styles.main}>

            <FindTeamSection teams={FAKE_TEAMS} />

          </div>

          <div className={styles.side}>
            <InviteTeamCard
              invites={FAKE_INVITES}
              onAccept={(id) => userHandleInvitation(id, true)}
              onReject={(id) => userHandleInvitation(id, false)}
              isFromTeam={true}
            />

            <RequestTeamCard
              requests={FAKE_REQUESTS}
              onCancel={(id) => handleCancel(id)}
              isFromTeam={true}
            />
          </div>

        </div>
      </div>

      {showCreateTeam && (
        <CreateTeamStep emailStatus={emailStatus} emailMessage={emailMessage} onClose={() => setShowCreateTeam(false)}
          onSubmit={(data) => {

            axios.post('http://localhost:8080/api/team/create', data, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(() => {
                setEmailMessage('Email hợp lệ')
                setEmailStatus('default')
                window.location.reload();
              })
              .catch((error) => {
                // lay data tu error 
                setEmailMessage(error.response.data)
                setEmailStatus('error')
                console.log(error)
              })
          }}
        />
      )}

      {showJoinByCode && (
        <JoinByCodeStep onClose={() => setShowJoinByCode(false)}
          onSubmit={(data) => {

            axios.post('http://localhost:8080/api/team/join-by-code', data, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then((response) => {
                console.log(response.data)
                window.location.reload()
              })
              .catch((error) => {
                console.log(error)
              })
          }}

        />
      )}


      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />

      <ConfirmModal
        isOpen={showKickedModal}
        title="Thông báo"
        message="Bạn đã bị xoá (kick) khỏi nhóm."
        confirmLabel="Đã hiểu"
        isNotification={true}
        onConfirm={handleCloseKickedModal}
        onCancel={handleCloseKickedModal}
      />

      <ConfirmModal
        isOpen={showApprovedLeaveModal}
        title="Thông báo"
        message="Yêu cầu rời nhóm của bạn đã được duyệt. Bạn đã rời khỏi nhóm."
        confirmLabel="Đã hiểu"
        isNotification={true}
        variant="info"
        onConfirm={() => setShowApprovedLeaveModal(false)}
        onCancel={() => setShowApprovedLeaveModal(false)}
      />

    </EventLayout >
  )
}


export default NoTeamView