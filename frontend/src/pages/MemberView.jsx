import { useState, useEffect } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import styles from './MemberView.module.css'
import axios from 'axios'

// const FAKE_MEMBERS = [
//   { id: 1, name: 'Nguyễn Thành Thái', email: 'ntbi533@gmail.com',  school: 'Đại học FPT', isLeader: true,  isCurrentUser: false },
//   { id: 2, name: 'Hồ Ngọc Bảo Trân',  email: 'tranhngb@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: true  },
//   { id: 3, name: 'Mạc Minh Tùng',     email: 'mtung638@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
// ]



const FAKE_LEAVE_REQUESTS = [
    // {
    //     id: 101,
    //     memberId: 8,
    //     name: "Nguyễn Thành Thái",   
    //     message: "Mình muốn rời đội để tìm team phù hợp hơn.",
    // }
]


function MemberView() {
  const [teamStatus, setTeamStatus] = useState('OPEN')
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const token = localStorage.getItem("accessToken")
  const [teamInfo, setTeamInfo] = useState({ teamName: '', description: '', teamCode: '', teamStatus: '' });
  const [leaveRequest, setLeaveRequest] = useState([])
  // api lấy team info
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/team-info'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setTeamInfo(response.data);
        setTeamStatus(response.data.teamStatus);
      })
      .catch((error) => console.log(error));
  }, []);


  // api lấy team members thành viên đội 
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/my-team'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_MEMBERS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);




  const handleOnLeave = (message) => {

    // const isConfirmed = window.confirm("Bạn có chắc chắn muốn rời khỏi nhóm này không? Hành động này không thể hoàn tác!");

    // if (isConfirmed) {
      axios
        .post('http://localhost:8080/api/teamrequest/out-team', {message : message}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        })
        .then((response) => {
          console.log(response.data);
          // alert("Bạn đã gui yeu cau roi nhóm thành công!");
          const responseData = {
            id: response.id, name: response.name, message: response.message
          }
          setLeaveRequest([response.data])
          // window.location.reload();
        })
        .catch((error) => {
          console.log(error);
          alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
        });
    // } else {
    //   console.log("Người dùng đã hủy bỏ yêu cầu rời nhóm.");
    // }
  };



  const handleOnCancelLeave = (id) => {
    axios
      .post('http://localhost:8080/api/teamrequest/out-team/cancle', id, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // nếu có JWT
        }
      })
      .then((response) => {
        console.log(response.data);

        setConfirmModal({
              message: 'Bạn đã hủy yêu cầu rời nhóm thành công!',
              confirmLabel: 'Xác nhận',
              isNotification: true,
              onConfirm: () => {window.location.reload()}
        })

        // alert("Bạn đã gui yeu cau roi nhóm thành công!");
        // window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể hủy rời nhóm lúc này.");
      });
  }

  return (
    <EventLayout>
      <div className={styles.page}>

        <TeamInfoHeader
          teamName={teamInfo.teamName}
          teamStatus={teamStatus}
          description={teamInfo.description}
          showFindMember={false}
        />

        <TeamMemberPanel
          members={FAKE_MEMBERS}
          maxSlots={4}
          teamStatus={teamStatus}
          isLeader={false}
          leaveRequests={FAKE_LEAVE_REQUESTS}
          onLeave={handleOnLeave}
          onCancelLeave={(id) => handleOnCancelLeave(id)}
          leaveRequests={leaveRequest}
        // Không truyền onKick, onPromote, onLockTeam → member không thấy các nút đó
        />

      </div>
    </EventLayout>
  )
}

export default MemberView