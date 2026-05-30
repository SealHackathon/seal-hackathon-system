import { useState } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import RequestCard from '../components/leaderView/RequestCard'
import InviteCard from '../components/leaderView/InviteCard'
import styles from './LeaderView.module.css'

// Data tạm — sau này thay bằng API
const FAKE_MEMBERS = [
  { id: 1, name: 'Nguyễn Thành Thái', email: 'ntbi533@gmail.com',    school: 'Đại học FPT', isLeader: true,  isCurrentUser: true  },
  { id: 2, name: 'Hồ Ngọc Bảo Trân',  email: 'tranhngb@gmail.com',   school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
  { id: 3, name: 'Mạc Minh Tùng',     email: 'mtung638@gmail.com',   school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
]

const FAKE_REQUESTS = [
  { id: 1, name: 'Hồ Ngọc Bảo Trân', email: 'hngbtran@gmail.com', message: 'Xin chào, mình rất ấn tượng với định hướng của Team bạn. Rất mong được tham gia vào Team của bạn.' },
]

const FAKE_INVITES = [
  { id: 1, name: 'Bùi Thiên Khánh',     email: 'btkhanh123@gmail.com'  },
  { id: 2, name: 'Phạm Khắc Đăng Khoa', email: 'khoapham4676@gmail.com' },
  { id: 3, name: 'Mạc Minh Tùng',       email: 'mtung638@gmail.com'     },
]

function LeaderView() {
  const [teamStatus, setTeamStatus] = useState('pending')

  return (
    <EventLayout>
      <div className={styles.page}>

        {/* Thanh info đội — full width */}
        <TeamInfoHeader
          teamName="SEAL Hackathon"
          description="Giới thiệu ngắn về đội bạn và định hướng giải quyết bài toán. Giới thiệu ngắn về đội bạn và định hướng giải quyết bài toán. Giới thiệu ngắn về đội bạn và định hướng giải quyết bài toán. Giới thiệu ngắn về đội bạn và định hướng giải quyết bài toán."
          teamCode="ABCXYZ"
          onFindMember={() => console.log('mở popup tìm thành viên')}
        />

        {/* 2 cột bên dưới */}
        <div className={styles.content}>

          <div className={styles.main}>
            <TeamMemberPanel
              members={FAKE_MEMBERS}
              maxSlots={4}
              teamStatus={teamStatus}
              onLockTeam={() => setTeamStatus('waiting')}
              onKick={(id) => console.log('kick', id)}
              onPromote={(id) => console.log('phong leader', id)}
              onLeave={() => console.log('rời đội')}
            />
          </div>

          <div className={styles.side}>
            <RequestCard
              requests={FAKE_REQUESTS}
              onAccept={(id) => console.log('đồng ý', id)}
              onReject={(id) => console.log('từ chối', id)}
            />
            <InviteCard
              invites={FAKE_INVITES}
              onCancel={(id) => console.log('hủy lời mời', id)}
            />
          </div>

        </div>
      </div>
    </EventLayout>
  )
}

export default LeaderView