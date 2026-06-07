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
import CreateTeamStep from '../components/joinFlow/CreateTeamStep'
import JoinByCodeStep from '../components/joinFlow/JoinByCodeStep'
// import { data } from 'react-router-dom'

function NoTeamView() {
  const [teamStatus, setTeamStatus] = useState('pending')
  const token = localStorage.getItem("accessToken");
  const [FAKE_INVITES, setFAKE_INVITES] = useState([]);
  const [FAKE_REQUESTS, setFAKE_REQUESTS] = useState([]);
  const [FAKE_TEAMS, setFAKE_TEAMS] = useState([]);
  // api sinh vien xem những invitation gui toi minh
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/teamrequest/member-invitation'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_INVITES(response.data);
      
      })
      .catch((error) => console.log(error));
  }, []);


  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/needing-members'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
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
            isLeader : m.isLeader
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
    axios
      .get('http://localhost:8080/api/teamrequest/member-request'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_REQUESTS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);


  // api sinh vien accept invitation
  const userHandleInvitation = (requestId, isAccepted) => {
    axios
      .put('http://localhost:8080/api/teamrequest/invitation-response', {
        requestId: requestId,
        accept: isAccepted
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        console.log(response.data);
        alert("thành công!");
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
    if (confirm('Bạn có chắc chắn muốn hủy lời mời này không?')) {
      axios
        .delete('http://localhost:8080/api/teamrequest/request', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          data: requestId
        })
        .then((response) => {
          console.log(response.data);

          // Hiện thông báo thành công cho người dùng biết
          alert("Đã hủy lời mời thành công!");

          //  Tải lại trang để cập nhật giao diện (mất lời mời vừa hủy)
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
          alert("Có lỗi xảy ra khi hủy lời mời!");
        });
    } else {
      // Người dùng bấm "Hủy" (Cancel) -> Không làm gì cả
      console.log("Đã dừng thao tác hủy lời mời.")
    }
  });
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinByCode, setShowJoinByCode] = useState(false)
  const [emailStatus, setEmailStatus] = useState('default')
  const [emailMessage, setEmailMessage] = useState('')



  if (showCreateTeam) return <CreateTeamStep emailStatus={emailStatus} emailMessage={emailMessage} onClose={() => setShowCreateTeam(false)}
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
  if (showJoinByCode) return <JoinByCodeStep onClose={() => setShowJoinByCode(false)}
    onSubmit={(data) => {

      axios.post('http://localhost:8080/api/team/join-by-code', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          console.log(response.data)
        })
        .catch((error) => {
        console.log(error)
        })
    }}

  />
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
            />

            <RequestTeamCard
              requests={FAKE_REQUESTS}
              onCancel={(id) => handleCancel(id)}
            />
          </div>

        </div>
      </div>
    </EventLayout>
  )
}


export default NoTeamView