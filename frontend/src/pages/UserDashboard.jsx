import UserLayout from '../layouts/UserLayout'
import MilestoneBanner from '../components/dashboard/MilestoneBanner'
import LiveEventCard from '../components/dashboard/LiveEventCard'
// import styles from './UserDashboard.module.css'

const FAKE_TIMELINE = [
    { id: 1, name: 'Mở cổng đăng kí',   date: '2026-06-02T00:00:00', note: null },
    { id: 2, name: 'Đóng cổng đăng kí', date: '2026-07-20T00:00:00', note: 'Hoặc sớm hơn nếu đủ 50 đội tham dự.' },
    { id: 3, name: 'Workshop Online',    date: '2026-07-28T00:00:00', note: null },
    { id: 4, name: 'Vòng Sơ khảo',      date: '2026-07-30T00:00:00', note: 'Nộp sản phẩm trước 23:59.' },
    { id: 5, name: 'Vòng Chung kết',    date: '2026-07-31T00:00:00', note: null },
]

const FAKE_EVENT = {
    name:        'SEAL Hackathon Summer 2026',
    coverUrl:    null,
    topic:       'AI Agents for Software Innovation',
    description: 'SEAL Hackathon Summer 2026 là sự kiện mở đầu trong hệ thống SEAL – Software Engineering Agile League. Chủ đề mùa Summer 2026 là "AI Agents for Software Innovation", nơi sinh viên trải nghiệm áp dụng AI vào vòng đời phát triển phần mềm (SDLC), từ thu thập yêu cầu, thiết kế, phát triển, kiểm thử đến triển khai và giám sát vận hành.',
}

function UserDashboard() {
    return (
        <UserLayout showCard={false}>
            <MilestoneBanner timeline={FAKE_TIMELINE} />
            <LiveEventCard
                event={FAKE_EVENT}
                onJoin={() => console.log('Tham gia')}
                onViewRules={() => console.log('Chi tiết thể lệ')}
            />
        </UserLayout>
    )
}

export default UserDashboard