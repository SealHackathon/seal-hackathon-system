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

function DashboardPage() {
  const [invitations, setInvitations] = useState([])
  const [assignedEvent, setAssignedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    // TODO: điều hướng sang giao diện chấm thi của sự kiện
  }
  const handleManageTeams = (eventId) => {
    // TODO: điều hướng sang trang quản lý đội thi
  }
  const handleViewRubric = (eventId) => {
    // TODO: mở rubric / tiêu chí chấm điểm
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
      // API chưa trả tiến độ chấm điểm (done/total) và số team đang mentor
      // -> để undefined, AssignedEventCard cần xử lý trường hợp thiếu dữ liệu này
      judging: undefined,
      mentoring: undefined,
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