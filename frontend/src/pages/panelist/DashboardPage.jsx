import { Briefcase, EnvelopeSimpleOpen, Pen, Users } from '@phosphor-icons/react'
import PanelistLayout from '../../layouts/PanelistLayout'
import SectionHeader from '../../components/shared/SectionHeader'
import AssignedEventCard from '../../components/panelist/AssignedEventCard'
import InvitationBox from '../../components/panelist/InvitationBox'
import InvitationCard from '../../components/panelist/InvitationCard'
import EmptyState from '../../components/panelist/EmptyState'
import styles from './DashboardPage.module.css'
import { useEffect,useState } from 'react'
import axiosClient from '../../api/axiosClient'


// --- Mock data (thay bằng dữ liệu API sau) ---
const ASSIGNED_EVENTS = [
  {
    id: 1,
    name: 'SEAL Hackathon Summer 2026',
    // Thử đổi thành ['judge'] hoặc ['mentor'] để xem từng biến thể vai trò
    roles: ['judge', 'mentor'],
    theme: 'AI Agents for Software Innovation',
    description:
      'SEAL Hackathon Summer 2026 là sự kiện mở đầu trong hệ thống SEAL – Software Engineering Agile League. Chủ đề mùa Summer 2026 là "AI Agents for Software Innovation", nơi các đội thi xây dựng những tác nhân AI giúp tăng tốc quy trình phát triển phần mềm.',
    // Phân công theo vai trò (giám khảo theo vòng, mentor theo hạng mục)
    assignment: {
      // Giám khảo: mỗi vòng chấm hạng mục cụ thể hoặc tất cả hạng mục
      judge: {
        rounds: [
          {
            name: 'Vòng Sơ Khảo',
            allCategories: false,
            categories: ['AI Agents for Software Innovation', 'EdTech Track'],
          },
          {
            name: 'Vòng Chung Kết',
            allCategories: true,
            categories: [],
          },
        ],
      },
      // Mentor: phụ trách hạng mục cụ thể (có thể khác hạng mục làm giám khảo)
      mentor: {
        categories: ['Smart City & IoT'],
      },
    },
    stats: {
      teams: '42 / 100',
      participants: 268,
      categories: 4,
      rounds: 2,
    },
    timeline: [
      { date: '08/07/2026', label: 'Mở cổng đăng ký' },
      { date: '20/07/2026', label: 'Đóng cổng đăng ký' },
      { date: '28/07/2026', label: 'Workshop Online' },
      { date: '30/07/2026', label: 'Vòng Sơ khảo' },
      { date: '31/07/2026', label: 'Vòng Chung kết' },
    ],
    judging: { roundName: 'Vòng Sơ Khảo', done: 15, total: 20 },
    mentoring: { teamCount: 2 },
    currentRound: {
      index: 1,
      total: 2,
      name: 'Vòng Sơ Khảo',
      countdownLabel: 'Bắt đầu trong 12 ngày',
      submitDeadline: '21:00 - 05/08/2026',
      submitted: '0 / 100',
      rubricName: 'SEAL 2026',
      schedule: [
        { time: '08:00 – 08:30', title: 'Khai mạc', desc: 'Phát biểu khai mạc từ BTC' },
        { time: '08:30 – 12:00', title: 'Thuyết trình vòng 1', desc: 'Các team lần lượt trình bày' },
        { time: '12:00 – 13:00', title: 'Nghỉ trưa', desc: '' },
        { time: '13:00 – 17:00', title: 'Chấm điểm', desc: 'Giám khảo tổng hợp và chấm điểm' },
      ],
    },
  },
]

// const INVITATIONS = [
//   {
//     id: 1,
//     roleType: 'judge',
//     eventName: 'SEAL Hackathon Summer 2026',
//     scope: 'Giám khảo Track EdTech — Vòng sơ khảo',
//     eventLink: '#',
//   },
//   {
//     id: 2,
//     roleType: 'judge',
//     eventName: 'FPT Edu Research Festival 2026',
//     scope: 'Giám khảo vòng chung kết',
//     eventLink: '#',
//   },
//   {
//     id: 3,
//     roleType: 'mentor',
//     eventName: 'SEAL Hackathon Summer 2026',
//     scope: 'Mentor chuyên môn IoT & Smart City',
//     eventLink: '#',
//   },
//   {
//     id: 4,
//     roleType: 'mentor',
//     eventName: 'Green Tech Challenge 2026',
//     scope: 'Mentor định hướng sản phẩm',
//     eventLink: '#',
//   },
// ]

function DashboardPage() {


  const [invitations, setInvitations] = useState([]);


  // TODO: nối API — lấy danh sách sự kiện được phân công & lời mời



  //API get danh sách Loi Moi.
  useEffect(() => {
    axiosClient
      .get("/mentor-judge/invitations")
      .then((res) => {
        setInvitations(res.data);
      })
      .catch(console.error);
  }, []); 





  const judgeInvites = invitations.filter((i) => i.roleType === 'judge')
  const mentorInvites = invitations.filter((i) => i.roleType === 'mentor')

  const handleOpenScoring = (eventId) => {
    // TODO: điều hướng sang giao diện chấm thi của sự kiện
  }
  const handleManageTeams = (eventId) => {
    // TODO: điều hướng sang trang quản lý đội thi
  }
  const handleViewRubric = (eventId) => {
    // TODO: mở rubric / tiêu chí chấm điểm

  }
  const handleAccept = (invitationId) => {
    // TODO: gọi API chấp nhận lời mời
    
        axiosClient.post(`/mentor-judge/invitations/${invitationId}/accept`)
  }
  const handleDecline = (invitationId) => {
    // TODO: gọi API từ chối lời mời

    axiosClient.post(`/mentor-judge/invitations/${invitationId}/reject`)

  }

  return (
    <PanelistLayout activePage="overview">
      <div className={styles.page}>
        {/* ===== Sự kiện được phân công ===== */}
        <section className={styles.section}>
          <SectionHeader
            icon={Briefcase}
            title="Sự kiện được phân công"
            level="h1"
          />
          <div className={styles.assignedList}>
            {ASSIGNED_EVENTS.length > 0 ? (
              ASSIGNED_EVENTS.map((event) => (
                <AssignedEventCard
                  key={event.id}
                  event={event}
                  onOpenScoring={() => handleOpenScoring(event.id)}
                  onManageTeams={() => handleManageTeams(event.id)}
                  onViewRubric={() => handleViewRubric(event.id)}
                />
              ))
            ) : (
              <EmptyState
                icon={Briefcase}
                title="Chưa có sự kiện được phân công"
                description="Bạn chưa được phân công làm giám khảo hay mentor cho sự kiện nào. Khi có phân công mới, sự kiện sẽ hiện ở đây."
              />
            )}
          </div>

        </section>

        {/* ===== Lời mời tham gia ===== */}
        <section className={styles.section}>
          <SectionHeader
            icon={EnvelopeSimpleOpen}
            title="Lời mời tham gia"
            level="h1"
          />
          <div className={styles.inviteGrid}>
            {/* Box lời mời làm giám khảo */}
            <InvitationBox
              variant="green"
              icon={Pen}
              iconWeight="bold"
              title="Lời mời làm giám khảo"
              count={judgeInvites.length}
            >
              {judgeInvites.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={() => handleAccept(invitation.id)}
                  onDecline={() => handleDecline(invitation.id)}
                />
              ))}
            </InvitationBox>

            {/* Box lời mời làm mentor */}
            <InvitationBox
              variant="orange"
              icon={Users}
              iconWeight="bold"
              title="Lời mời làm mentor"
              count={mentorInvites.length}
            >
              {mentorInvites.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={() => handleAccept(invitation.id)}
                  onDecline={() => handleDecline(invitation.id)}
                />
              ))}
            </InvitationBox>
          </div>
        </section>
      </div>
    </PanelistLayout>
  )
}

export default DashboardPage