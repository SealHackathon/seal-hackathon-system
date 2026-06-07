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

function MemberView() {
  const [teamStatus] = useState('pending')
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const token = localStorage.getItem("accessToken")
  const [teamInfo, setTeamInfo] = useState({ teamName: '', description: '', teamCode: '' });

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


  const handleOnLeave = () => {

  const isConfirmed = window.confirm("Bạn có chắc chắn muốn rời khỏi nhóm này không? Hành động này không thể hoàn tác!");

  if (isConfirmed) {
    axios
      .put('http://localhost:8080/api/team/out-team', {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // nếu có JWT
        }
      })
      .then((response) => {
        console.log(response.data);
        alert("Bạn đã rời nhóm thành công!");
          window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });
  } else {
    console.log("Người dùng đã hủy bỏ yêu cầu rời nhóm.");
  }
};

const handleOnCancelLeave = (id) => { }

  return (
    <EventLayout>
      <div className={styles.page}>

        <TeamInfoHeader
          teamName={teamInfo.teamName}
          description={teamInfo.description}
          showFindMember={false}
        />

        <TeamMemberPanel
          members={FAKE_MEMBERS}
          maxSlots={4}
          teamStatus={teamStatus}
          isLeader={false}
          onLeave={handleOnLeave}
          onCancelLeave={(id) => handleOnCancelLeave(id)}
        // Không truyền onKick, onPromote, onLockTeam → member không thấy các nút đó
        />

      </div>
    </EventLayout>
  )
}

export default MemberView