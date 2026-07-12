import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EventLayout from '../layouts/EventLayout'
import RoundTimelineHorizontal from '../components/shared/submission/RoundTimelineHorizontal'
import SubmissionList from '../components/shared/submission/SubmissionList'
import ProgressCard from '../components/shared/submission/ProgressCard'
import UsefulInfoBox from '../components/shared/submission/UsefulInfoBox'
import SectionHeader from '../components/shared/SectionHeader'
import { Star, LineSegments, LockKey } from '@phosphor-icons/react'
import styles from './SubmissionPage.module.css'
import { useAuth } from '../AuthContext'
import axiosClient from '../api/axiosClient'

function formatDateLabel(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateRange(start, end) {
  const startLabel = start ? formatDateLabel(start) : null
  const endLabel = end ? formatDateLabel(end) : null

  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
  if (startLabel) return startLabel
  if (endLabel) return endLabel
  return 'Chưa cập nhật'
}

function resolveEventId(location) {
  const params = new URLSearchParams(location.search)
  const fromQuery = params.get('eventId')
  const fromState = location.state?.eventId
  const fromStorage = localStorage.getItem('eventId') || localStorage.getItem('activeEventId') || localStorage.getItem('currentEventId')

  const resolved = fromQuery || fromState || fromStorage
  if (resolved) {
    localStorage.setItem('eventId', String(resolved))
  }

  return resolved ? String(resolved) : null
}

function mapBackendRoundToUi(round) {
  const now = new Date()
  
  const startRaw = round.roundStartTime;
  const endRaw = round.roundEndTime;
  const deadlineRaw = round.submissionConfig?.submissionDeadline ?? round.roundSubmissionDeadline ?? round.submissionDeadline ?? round.deadline;
  
  const start = startRaw ? new Date(startRaw) : null
  const end = endRaw ? new Date(endRaw) : null
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null

  // Tính trạng thái vòng thi
  let status = 'UPCOMING'
  const backendStatus = round.status?.toUpperCase() || 'UPCOMING'
  
  if (backendStatus === 'IN_PROGRESS' || backendStatus === 'ACTIVE' || (start && end && now >= start && now <= end)) {
    status = 'ACTIVE'
  } else if (backendStatus === 'COMPLETED' || backendStatus === 'DONE' || (end && now > end)) {
    status = 'DONE'
  }

  // Tính số ngày còn lại (daysLeft)
  let daysLeft = undefined;
  if (deadline) {
    const diffTime = deadline.getTime() - now.getTime();
    if (diffTime > 0) {
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      daysLeft = 0;
    }
  }

  const hasSubmission = round.submissionConfig?.hasSubmission || round.hasSubmission || false;
  
  // Tính trạng thái nộp bài
  let submissionStatus = 'NOT_OPEN'
  if (status === 'UPCOMING') {
    submissionStatus = 'NOT_OPEN'
  } else if (status === 'DONE') {
    if (hasSubmission) {
      submissionStatus = 'SUBMITTED_ON_TIME'
    } else {
      submissionStatus = 'CLOSED_NO_SUBMISSION'
    }
  } else if (status === 'ACTIVE') {
    if (hasSubmission) {
      submissionStatus = 'SUBMITTED_ON_TIME'
    } else if (deadline && now > deadline) {
      status = 'LATE'; // Đổi màu cam cho card
      submissionStatus = 'LATE_NO_SUBMISSION'
    } else {
      submissionStatus = 'NO_SUBMISSION'
    }
  }

  // Chuẩn bị thông báo (Banner)
  let message = null
  const submissionInstructions = round.submissionConfig?.submissionInstructions ?? round.submissionGuide;
  
  if (submissionInstructions) {
    message = {
      type: 'info',
      title: 'Hướng dẫn nộp bài',
      content: submissionInstructions,
    }
  }

  if (hasSubmission) {
    message = {
      type: 'success',
      title: 'Đã nộp bài',
      content: 'Đội đã nộp bài dự thi thành công cho vòng này.',
    }
  } else if (submissionStatus === 'LATE_NO_SUBMISSION') {
    message = {
      type: 'warning',
      title: 'Đã quá hạn nộp bài',
      content: 'Đội chưa nộp bài đúng hạn cho vòng này. Bạn vẫn có thể nộp muộn nhưng sẽ bị trừ điểm theo quy định.',
    }
  }

  return {
    id: round.roundId ?? round.id,
    name: round.roundName ?? round.name ?? 'Vòng thi',
    dateRange: formatDateRange(start, end),
    status,
    submissionStatus,
    submissionDeadline: deadline ? formatDateLabel(deadline) : null,
    daysLeft,
    message,
    evaluation: round.scroringTemplateUrl ? {
      title: 'Tiêu chí chấm điểm',
      content: round.scroringTemplateUrl,
    } : null,
    roundNumber: round.roundOrdinalNumber ?? round.roundNumber,
    topTeamPass: round.topTeamPass,
    submissionQuantity: round.submissionQuantity,
    roundQuantity: round.roundQuantity,
    timelines: round.timelines ?? round.agenda ?? [],
    submissionConfig: round.submissionConfig,
  }
}

function buildProgress(rounds = []) {
  if (!Array.isArray(rounds) || rounds.length === 0) return null

  const activeRoundIndex = rounds.findIndex((round) => round.status === 'ACTIVE' || round.status === 'LATE')
  const currentIndex = activeRoundIndex >= 0 ? activeRoundIndex + 1 : 1
  const totalRounds = rounds[0]?.roundQuantity || rounds.length
  const percentage = totalRounds > 0 ? Math.round((currentIndex / totalRounds) * 100) : 0

  return {
    currentRoundIndex: currentIndex,
    totalRounds,
    percentage,
    currentRoundName: rounds[activeRoundIndex >= 0 ? activeRoundIndex : 0]?.name || 'Chưa có vòng nào',
    rank: '—',
    totalTeams: '—',
    score: '—',
    maxScore: '—',
    groupName: '—',
  }
}

async function fetchRoundDetails(eventId) {
  const params = eventId ? { eventId } : {}
  const candidateEndpoints = ['/round/details', '/round/team', '/round/my-team', '/round']

  let lastError = null

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await axiosClient.get(endpoint, { params })
      const payload = response?.data
      const rounds = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.rounds)
          ? payload.rounds
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.content)
              ? payload.content
              : null

      if (rounds) {
        return { rounds, payload }
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Không thể tải dữ liệu vòng thi từ backend')
}

function SubmissionPage() {
  const { teamRole } = useAuth()
  const location = useLocation()
  const [rounds, setRounds] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamStatus, setTeamStatus] = useState(null)

  useEffect(() => {
    let isMounted = true
    const eventId = resolveEventId(location)

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        if (!eventId) {
          setRounds([])
          setProgress(null)
          setError('Chưa có eventId. Hãy mở trang từ sự kiện và truyền ?eventId=... hoặc lưu vào localStorage trước.')
          return
        }

        const [roundsResult, teamInfoResult] = await Promise.allSettled([
          fetchRoundDetails(eventId),
          axiosClient.get('/team/team-info')
        ])

        if (!isMounted) return

        if (teamInfoResult.status === 'fulfilled') {
          setTeamStatus(teamInfoResult.value.data?.teamStatus)
        }

        if (roundsResult.status === 'fulfilled') {
          const { rounds: backendRounds } = roundsResult.value
          const normalizedRounds = (backendRounds || []).map(mapBackendRoundToUi)
          setRounds(normalizedRounds)
          setProgress(buildProgress(normalizedRounds))
        } else {
          throw roundsResult.reason
        }
      } catch (err) {
        console.error('Failed to load submission rounds:', err)
        if (!isMounted) return
        setRounds([])
        setProgress(null)
        setError('Không thể tải dữ liệu từ backend. Vui lòng kiểm tra eventId và endpoint.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [location.search, location.state])

  const activeRound = rounds.find((round) => round.status === 'ACTIVE' || round.status === 'LATE')

  return (
    <EventLayout activePage='submit'>
      <div className={styles.page}>
        <SectionHeader
          icon={Star}
          title="Hành trình Dự thi"
          level="h1"
        />

        {loading && <p>Đang tải dữ liệu vòng thi...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && teamStatus !== 'APPROVED' ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <LockKey size={48} weight="fill" color="var(--color-primary-blue)" />
            </div>
            <h2>Chưa thể nộp bài</h2>
            <p>
              Đội của bạn cần được Ban tổ chức phê duyệt danh sách thành viên trước khi tham gia các vòng thi.<br/>
              Vui lòng quay lại sau khi đội đã được duyệt nhé.
            </p>
          </div>
        ) : (
          !loading && !error && (
            <>
              <div className={styles.topSection}>
                <div className={styles.timelineContainer}>
                  <RoundTimelineHorizontal rounds={rounds} />
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.mainColumn}>
                  <SectionHeader icon={LineSegments} title="Chi tiết các vòng thi" level="h1" />
                  <div className={styles.mainContainer}>
                    <div>
                      <SubmissionList rounds={rounds} role={teamRole} />
                    </div>
                  </div>
                </div>

                <div className={styles.sideColumn}>
                  <div className={styles.stickyWrapper}>
                    <ProgressCard progress={progress} activeRound={activeRound} />
                    <UsefulInfoBox />
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </EventLayout>
  )
}

export default SubmissionPage;
