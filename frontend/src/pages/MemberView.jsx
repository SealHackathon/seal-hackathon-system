import { useState } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import styles from './MemberView.module.css'

const FAKE_MEMBERS = [
  { id: 1, name: 'Nguyễn Thành Thái', email: 'ntbi533@gmail.com',  school: 'Đại học FPT', isLeader: true,  isCurrentUser: false },
  { id: 2, name: 'Hồ Ngọc Bảo Trân',  email: 'tranhngb@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: true  },
  { id: 3, name: 'Mạc Minh Tùng',     email: 'mtung638@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
]

function MemberView() {
  const [teamStatus] = useState('pending')

  return (
    <EventLayout>
      <div className={styles.page}>

        <TeamInfoHeader
          teamName="Tên đội Tên đội Tên đội"
          description="Giới thiệu ngắn về đội bạn và định hướng giải quyết bài toán."
          teamCode="ABCXYZ"
          showFindMember={false}
        />

        <TeamMemberPanel
          members={FAKE_MEMBERS}
          maxSlots={4}
          teamStatus={teamStatus}
          isLeader={false}
          onLeave={() => console.log('rời đội')}
          // Không truyền onKick, onPromote, onLockTeam → member không thấy các nút đó
        />

      </div>
    </EventLayout>
  )
}

export default MemberView