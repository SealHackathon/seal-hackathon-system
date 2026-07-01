import { useState, useEffect } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import InviteTeamCard from '../components/noTeamView/InviteTeamCard'
import styles from './MemberView.module.css'
import axios from 'axios'

const MOCK_MEMBERS = [
  {
    id: 1,
    name: 'Nguyễn Thành Thái',
    email: 'nthai@gmail.com',
    school: 'Đại học FPT',
    isLeader: true,
    isCurrentUser: false,
    memberStatus: 'OFFICAL',
    joinMethod: undefined,
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'Next.js', 'Tailwind CSS'], backend: ['Spring Boot'] },
    topics: ['Web Development'],
    cvLink: 'https://github.com/Thaibc',
  },
  {
    id: 2,
    name: 'Bùi Thiên Khánh',
    email: 'btkhanh123@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'OFFICAL',
    joinMethod: 'INVITE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với các công nghệ Frontend như React và Vue, luôn thích tối ưu hóa UI/UX để mang lại trải nghiệm tốt nhất.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'Vue', 'Tailwind CSS'] },
    topics: ['Web Development', 'Frontend Architecture'],
    cvLink: 'https://github.com/in/Kbuiii',
  },
  {
    id: 3,
    name: 'Mạc Minh Tùng',
    email: 'mtung638@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'OFFICAL',
    joinMethod: 'REQUEST',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình chuyên về phía Backend, có kinh nghiệm làm việc với Java, Spring Boot và quản trị cơ sở dữ liệu MySQL, Redis.',
    positions: ['Backend Developer'],
    techTags: { backend: ['Java', 'Spring Boot', 'MySQL', 'Redis'] },
    topics: ['System Design', 'Cloud Computing'],
    cvLink: 'https://github.com/Mtung0603',
  },
  {
    id: 4,
    name: 'Hồ Ngọc Bảo Trân',
    email: 'hngbtran@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: true,
    memberStatus: 'RESERVE',
    joinMethod: 'CODE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình yêu thích sự kết hợp giữa thiết kế và công nghệ, đảm nhận tốt cả hai vai trò Frontend Developer và UI/UX Designer.',
    positions: ['Frontend Developer', 'UI/UX Designer'],
    techTags: { frontend: ['React', 'Tailwind CSS'], design: ['Figma', 'Adobe XD'] },
    topics: ['UI/UX Design', 'Web Development'],
    cvLink: 'https://github.net/hngbtran',
  },
  {
    id: 5,
    name: 'Phạm Khắc Đăng Khoa',
    email: 'khoapkd@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'RESERVE',
    joinMethod: 'INVITE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình đam mê học hỏi các công nghệ web mới, chuyên phát triển Frontend với React và luôn sẵn sàng hỗ trợ team.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'JavaScript', 'HTML/CSS'] },
    topics: ['Web Development', 'Creative Coding'],
    cvLink: 'https://github.com/khoa2099',
  },
]

const MOCK_INVITES = [
  {
    id: 10,
    teamId: 101,
    teamName: 'Dream Team FPT',
    description: 'Đội thi đấu Hackathon cần tuyển Frontend.',
  }
]

const FAKE_LEAVE_REQUESTS = []

function MemberView() {
  const [teamStatus, setTeamStatus] = useState('OPEN')
  // Use mock data for testing UI
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const [FAKE_INVITES, setFAKE_INVITES] = useState(MOCK_INVITES);

  const token = localStorage.getItem("accessToken")
  const [teamInfo, setTeamInfo] = useState({ teamName: 'SEAL Hackathon Team', description: 'Đội thi của chúng mình', teamCode: 'SEAL2026', teamStatus: 'OPEN' });
  const [leaveRequest, setLeaveRequest] = useState([])

  useEffect(() => {
    localStorage.setItem('lastKnownTeamRole', 'IN_TEAM');
  }, []);

  // api lấy team info - comment out to use mock data for testing
  /*
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/team-info', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
      })
      .then((response) => {
        setTeamInfo(response.data);
        setTeamStatus(response.data.teamStatus);
      })
      .catch((error) => console.log(error));
  }, []);
  */

  // api lấy team members - comment out to use mock data

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/my-team', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
      })
      .then((response) => {
        setFAKE_MEMBERS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);


  const handleOnLeave = (message) => {
    axios
      .post('http://localhost:8080/api/teamrequest/out-team', { message: message }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        console.log(response.data);
        const responseData = {
          id: response.id, name: response.name, message: response.message
        }
        setLeaveRequest([response.data])
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });
  };

  const handleOnCancelLeave = (id) => {
    axios
      .post('http://localhost:8080/api/teamrequest/out-team/cancle', id, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        console.log(response.data);
        alert("Bạn đã hủy yêu cầu rời nhóm thành công!");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể hủy rời nhóm lúc này.");
      });
  }

  const handleAcceptInvite = (id) => {
    alert("Đã chấp nhận lời mời (Mock). Bạn sẽ rời team hiện tại.");
    setFAKE_INVITES(prev => prev.filter(inv => inv.id !== id));
  }

  const handleRejectInvite = (id) => {
    alert("Đã từ chối lời mời (Mock).");
    setFAKE_INVITES(prev => prev.filter(inv => inv.id !== id));
  }

  const currentUser = FAKE_MEMBERS.find(m => m.isCurrentUser);

  return (
    <EventLayout>
      <div className={styles.page}>

        <TeamInfoHeader
          teamName={teamInfo.teamName}
          teamStatus={teamStatus}
          description={teamInfo.description}
          showFindMember={false}
        />

        <div className={styles.content}>
          <div className={styles.main}>
            <TeamMemberPanel
              members={FAKE_MEMBERS}
              maxSlots={4}
              teamStatus={teamStatus}
              isLeader={false}
              leaveRequests={FAKE_LEAVE_REQUESTS}
              onLeave={handleOnLeave}
              onCancelLeave={(id) => handleOnCancelLeave(id)}
            />
          </div>

          <div className={styles.side}>
            <InviteTeamCard
              invites={currentUser?.memberStatus === 'OFFICAL' ? [] : FAKE_INVITES}
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
              isFromTeam={true}
              emptyText={
                currentUser?.memberStatus === 'OFFICAL'
                  ? "Thành viên chính thức sẽ không nhận được lời mời tham gia từ đội khác."
                  : "Chưa có lời mời nào."
              }
            />
          </div>
        </div>

      </div>
    </EventLayout>
  )
}

export default MemberView