import FindTeamSection from './components/noTeamView/FindTeamSection'
import LeaderView from './pages/LeaderView'
import MemberView from './pages/MemberView'
import NoTeamView from './pages/NoTeamView'


const FAKE_TEAMS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: 'Tên đội',
  description: 'Giới thiệu ngắn về đội của bạn và định hướng giải quyết bài toán.',
  maxSlots: 4,
  members: [
    { id: 10, name: 'Nguyễn Thành Thái', school: 'Đại học FPT' },
    { id: 11, name: 'Hồ Ngọc Bảo Trân',  school: 'Đại học FPT' },
  ],
  isRequested: false,
}))


function App() {
  return (
    <div>
      <LeaderView />
      <MemberView />
      <NoTeamView />
    </div>
  )
}

export default App