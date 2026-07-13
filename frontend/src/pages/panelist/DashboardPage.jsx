import { Briefcase, EnvelopeSimpleOpen, Pen, Users } from '@phosphor-icons/react'
import PanelistLayout from '../../layouts/PanelistLayout'
import SectionHeader from '../../components/shared/SectionHeader'
import AssignedEventCard from '../../components/panelist/AssignedEventCard'
import InvitationBox from '../../components/panelist/InvitationBox'
import InvitationCard from '../../components/panelist/InvitationCard'
import EmptyState from '../../components/panelist/EmptyState'
import styles from './DashboardPage.module.css'
import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import { useNavigate } from 'react-router-dom'

// // --- Mock data (thay bằng dữ liệu API sau) ---
// const ASSIGNED_EVENTS = [
//   {
//     id: 1,
//     name: 'SEAL Hackathon Summer 2026',
//     // Thử đổi thành ['judge'] hoặc ['mentor'] để xem từng biến thể vai trò
//     roles: ['judge', 'mentor'],
//     theme: 'AI Agents for Software Innovation',
//     description:
//       'SEAL Hackathon Summer 2026 là sự kiện mở đầu trong hệ thống SEAL – Software Engineering Agile League. Chủ đề mùa Summer 2026 là "AI Agents for Software Innovation", nơi các đội thi xây dựng những tác nhân AI giúp tăng tốc quy trình phát triển phần mềm.',
//     // Phân công theo vai trò (giám khảo theo vòng, mentor theo hạng mục)
//     assignment: {
//       // Giám khảo: mỗi vòng chấm hạng mục cụ thể hoặc tất cả hạng mục
//       judge: {
//         rounds: [
//           {
//             name: 'Vòng Sơ Khảo',
//             allCategories: false,
//             categories: ['AI Agents for Software Innovation', 'EdTech Track'],
//           },
//           {
//             name: 'Vòng Chung Kết',
//             allCategories: true,
//             categories: [],
//           },
//         ],
//       },
//       // Mentor: phụ trách hạng mục cụ thể (có thể khác hạng mục làm giám khảo)
//       mentor: {
//         categories: ['Smart City & IoT'],
//       },
//     },
//     stats: {
//       teams: '42 / 100',
//       participants: 268,
//       categories: 4,
//       rounds: 2,
//     },
//     timeline: [
//       { date: '08/07/2026', label: 'Mở cổng đăng ký' },
//       { date: '20/07/2026', label: 'Đóng cổng đăng ký' },
//       { date: '28/07/2026', label: 'Workshop Online' },
//       { date: '30/07/2026', label: 'Vòng Sơ khảo' },
//       { date: '31/07/2026', label: 'Vòng Chung kết' },
//     ],
//     judging: { roundName: 'Vòng Sơ Khảo', done: 15, total: 20 },
//     mentoring: { teamCount: 2 },
//     currentRound: {
//       index: 1,
//       total: 2,
//       name: 'Vòng Sơ Khảo',
//       countdownLabel: 'Bắt đầu trong 12 ngày',
//       submitDeadline: '21:00 - 05/08/2026',
//       submitted: '0 / 100',
//       rubricName: 'SEAL 2026',
//       schedule: [
//         { time: '08:00 – 08:30', title: 'Khai mạc', desc: 'Phát biểu khai mạc từ BTC' },
//         { time: '08:30 – 12:00', title: 'Thuyết trình vòng 1', desc: 'Các team lần lượt trình bày' },
//         { time: '12:00 – 13:00', title: 'Nghỉ trưa', desc: '' },
//         { time: '13:00 – 17:00', title: 'Chấm điểm', desc: 'Giám khảo tổng hợp và chấm điểm' },
//       ],
//     },
//   },
// ]


function DashboardPage() {
  const [invitations, setInvitations] = useState([])
  const [assignedEvent, setAssignedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // ===== API: lấy sự kiện được phân công =====
  useEffect(() => {
    let isMounted = true // tránh setState khi component đã unmount

    const fetchAssignedEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axiosClient.get('/mentor-judge/assigned-event')

        if (isMounted) {
          setAssignedEvent(response.data)
        }
      } catch (err) {
        if (isMounted) {
          // Nếu user chưa được phân công, backend hiện trả lỗi (RuntimeException -> 500).
          // Coi đây là "chưa có sự kiện" thay vì lỗi hệ thống, để hiển thị EmptyState thay vì error.
          setAssignedEvent(null)
          const message =
            err.response?.data?.message ||
            err.response?.data ||
            'Không thể tải dữ liệu sự kiện được phân công.'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAssignedEvent()

    return () => {
      isMounted = false
    }
  }, [])

  // ===== API: lấy danh sách lời mời =====
  useEffect(() => {
    axiosClient
      .get('/mentor-judge/invitations')
      .then((res) => {
        setInvitations(res.data)
      })
      .catch(console.error)
  }, [])

  const judgeInvites = invitations.filter((i) => i.roleType === 'judge')
  const mentorInvites = invitations.filter((i) => i.roleType === 'mentor')

  const handleOpenScoring = (eventId) => {
    const assignedRounds = assignedEvent?.assignment?.judge?.rounds || [];
    let targetRoundId = null;

    if (assignedRounds.length > 0) {
      const now = new Date();

      // 🎯 CHIẾN LƯỢC 1: Tìm vòng đang diễn ra ngay tại thời điểm này
      const activeRound = assignedRounds.find(r => {
        const start = new Date(r.timeStart);
        const end = new Date(r.timeEnd);
        return now >= start && now <= end;
      });

      if (activeRound) {
        targetRoundId = activeRound.roundId;
      } else {
        // 🎯 CHIẾN LƯỢC 2: Không có vòng nào chạy -> Tìm vòng có thời gian diễn ra GẦN NHẤT
        let minDistance = Infinity;

        assignedRounds.forEach(r => {
          const start = new Date(r.timeStart);
          // Tính độ lệch thời gian (trị tuyệt đối) tính bằng mili-giây
          const distance = Math.abs(now.getTime() - start.getTime());

          if (distance < minDistance) {
            minDistance = distance;
            targetRoundId = r.roundId;
          }
        });
      }
    }

    // 3. Tiến hành điều hướng
    if (eventId && targetRoundId) {
      navigate(`/panelist/events/${eventId}/judge/rounds/${targetRoundId}`);
    } else {
      console.warn("Không xác định được vòng chấm phù hợp.");
      navigate(`/panelist/dashboard`);
    }


    // 3. Tiến hành điều hướng
    if (eventId && targetRoundId) {
      navigate(`/panelist/events/${eventId}/judge/rounds/${targetRoundId}`);
    } else {
      console.warn("Không xác định được vòng chấm phù hợp.");
      navigate(`/panelist/dashboard`);
    }
  };

  const handleManageTeams = (eventId) => {
    // TODO: điều hướng sang trang quản lý đội thi
    navigate(`/panelist/events/${eventId}`)
  }


  
  const handleViewRubric = (eventId) => {
    // TODO: mở rubric / tiêu chí chấm điểm
    navigate(`/panelist/events/${eventId}?tab=rubric`)
  }
  const handleAccept = (invitationId) => {
    axiosClient.post(`/mentor-judge/invitations/${invitationId}/accept`)
    window.location.reload()
  }
  const handleDecline = (invitationId) => {
    axiosClient.post(`/mentor-judge/invitations/${invitationId}/reject`)
    window.location.reload()
  }

  // ===== Adapter: chuyển response API (AssignedEventResponseDTO) =====
  // ===== sang shape mà AssignedEventCard đang mong đợi (theo mock cũ) =====
  const mapToCardEvent = (apiEvent) => {
    if (!apiEvent) return null

    const { id, name, theme, description, roles, assignment, stats, currentRound } = apiEvent

    return {
      id,
      name,
      roles,
      theme,
      description,
      assignment: {
        judge: assignment?.judge
          ? {
            rounds: assignment.judge.rounds.map((r) => ({
              name: r.name,
              allCategories: r.allCategories,
              categories: r.categories,
            })),
          }
          : undefined,
        mentor: assignment?.mentor
          ? { categories: assignment.mentor.categories }
          : undefined,
      },
      stats: {
        // API trả số nguyên, mock cũ dùng string "42/100" (đăng ký/giới hạn)
        // -> tạm hiển thị số team hiện có, vì API chưa có "giới hạn tối đa"  
        teams: `${stats?.teamCount ?? 0}`,
        participants: stats?.participantCount ?? 0,
        categories: stats?.categoryCount ?? 0,
        rounds: stats?.roundCount ?? 0,
      },
      // API chưa trả timeline tổng của event (chỉ có schedule của currentRound)
      // -> tạm để rỗng, cần bổ sung API riêng nếu muốn hiển thị đầy đủ mốc thời gian sự kiện
      timeline: [],
      // API chưa trả tiến độ chấm điểm (done/total)
      // -> để undefined, AssignedEventCard cần xử lý trường hợp thiếu dữ liệu này
      judging: undefined,
      mentoring: assignment?.mentor?.teams ? { teamCount: assignment.mentor.teams.length } : undefined,
      currentRound: currentRound
        ? {
          index: currentRound.index,
          total: currentRound.total,
          name: currentRound.name,
          countdownLabel: undefined, // API chưa có, cần tính từ startTime nếu muốn hiển thị
          submitDeadline: currentRound.submissionDeadline,
          submitted: undefined, // API chưa có số bài đã nộp
          rubricName: undefined, // API chưa trả rubric
          schedule: currentRound.schedule ?? [],
        }
        : undefined,
    }
  }

  const cardEvent = mapToCardEvent(assignedEvent)
  const assignedEventsList = cardEvent ? [cardEvent] : []

  return (
    <PanelistLayout activePage="overview">
      <div className={styles.page}>
        {/* ===== Sự kiện được phân công ===== */}
        <section className={styles.section}>
          <SectionHeader icon={Briefcase} title="Sự kiện được phân công" level="h1" />
          <div className={styles.assignedList}>
            {loading ? (
              <div>Đang tải dữ liệu sự kiện...</div>
            ) : assignedEventsList.length > 0 ? (
              assignedEventsList.map((event) => (
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
          <SectionHeader icon={EnvelopeSimpleOpen} title="Lời mời tham gia" level="h1" />
          <div className={styles.inviteGrid}>
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