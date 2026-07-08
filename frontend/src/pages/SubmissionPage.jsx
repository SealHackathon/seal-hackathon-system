import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EventLayout from '../layouts/EventLayout'
import RoundTimelineHorizontal from '../components/shared/submission/RoundTimelineHorizontal'
import SubmissionList from '../components/shared/submission/SubmissionList'
import ProgressCard from '../components/shared/submission/ProgressCard'
import UsefulInfoBox from '../components/shared/submission/UsefulInfoBox'
import SectionHeader from '../components/shared/SectionHeader'
import { Star, LineSegments } from '@phosphor-icons/react'
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
  const start = round.roundStartTime ? new Date(round.roundStartTime) : null
  const end = round.roundEndTime ? new Date(round.roundEndTime) : null
  const deadline = round.roundSubmissionDeadline ? new Date(round.roundSubmissionDeadline) : null

  let status = 'UPCOMING'
  if (round.status === 'IN_PROGRESS' || (start && end && now >= start && now <= end)) {
    status = 'ACTIVE'
  } else if (round.status === 'COMPLETED' || (end && now > end)) {
    status = 'DONE'
  }

  let submissionStatus = 'NOT_OPEN'
  if (status === 'UPCOMING') {
    submissionStatus = 'NOT_OPEN'
  } else if (round.submissionConfig?.hasSubmission) {
    submissionStatus = 'SUBMITTED_ON_TIME'
  } else if (deadline && now > deadline) {
    submissionStatus = 'LATE_NO_SUBMISSION'
  } else if (status === 'DONE') {
    submissionStatus = 'CLOSED_NO_SUBMISSION'
  } else {
    submissionStatus = 'NO_SUBMISSION'
  }

  let message = null
  if (round.submissionConfig?.submissionInstructions) {
    message = {
      type: 'info',
      title: 'Hướng dẫn nộp bài',
      content: round.submissionConfig.submissionInstructions,
    }
  }

  if (status === 'DONE' && round.submissionConfig?.hasSubmission) {
    message = {
      type: 'success',
      title: 'Đã nộp bài',
      content: 'Đội đã nộp bài cho vòng này.',
    }
  } else if (deadline && now > deadline && !round.submissionConfig?.hasSubmission) {
    message = {
      type: 'warning',
      title: 'Đã quá hạn nộp bài',
      content: 'Đội chưa nộp bài đúng hạn cho vòng này.',
    }
  }

  return {
    id: round.roundId,
    name: round.roundName,
    dateRange: formatDateRange(start, end),
    status,
    submissionStatus,
    submissionDeadline: deadline ? formatDateLabel(deadline) : null,
    message,
    evaluation: round.scroringTemplateUrl ? {
      title: 'Tiêu chí chấm điểm',
      content: round.scroringTemplateUrl,
    } : null,
    roundNumber: round.roundOrdinalNumber,
    topTeamPass: round.topTeamPass,
    submissionQuantity: round.submissionQuantity,
    roundQuantity: round.roundQuantity,
    timelines: round.timelines ?? [],
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

        const { rounds: backendRounds } = await fetchRoundDetails(eventId)
        if (!isMounted) return

        const normalizedRounds = (backendRounds || []).map(mapBackendRoundToUi)
        setRounds(normalizedRounds)
        setProgress(buildProgress(normalizedRounds))
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
      </div>
    </EventLayout>
  )
}

export default SubmissionPage;
