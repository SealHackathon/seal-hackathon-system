import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StickyHeader from '../../components/shared/StickyHeader'
import JudgeRoundHero from '../../components/panelist/event/judgeRoundDetail/JudgeRoundHero'
import JudgeScoringProgress from '../../components/panelist/event/judgeRoundDetail/JudgeScoringProgress'
import JudgeSubmissionTable from '../../components/panelist/event/judgeRoundDetail/JudgeSubmissionTable'
import styles from './JudgeRoundDetailPage.module.css'
import axiosClient from '../../api/axiosClient'
import { useNavigate } from 'react-router-dom';

function JudgeRoundDetailPage({ backLink = '/panelist/events/1?tab=judge' }) {
  const { eventId, roundId } = useParams()

  const navigate = useNavigate();

  const handleScore = (submissionId) => {
    // Chuyển hướng chính xác theo Route cấu hình của bạn
    navigate(`/panelist/events/${eventId}/judge/rounds/${roundId}/submissions/${submissionId}`);
  };

  const [round, setRound] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [roundRes, submissionsRes] = await Promise.all([
          axiosClient.get(`/round/rounds/${roundId}`),
          axiosClient.get(`/submission?roundId=${roundId}`)
        ])

        const roundData = roundRes.data
        const rawSubmissions = submissionsRes.data

        // 1. Map dữ liệu Round thông tin
        const formattedRound = {
          id: roundData.roundId,
          name: roundData.roundName,
          ordinal: roundData.roundOrdinalNumber,
          lifecycle: roundData.status,
          timeStart: new Date(roundData.roundStartTime),
          timeEnd: new Date(roundData.roundEndTime),
          submissionDeadline: new Date(roundData.roundSubmissionDeadline),
          criteria: roundData.criteria,
          timelines: roundData.timelines
        }

        // 2. Map mảng danh sách bài nộp từ API thực tế của bạn
        const formattedSubmissions = rawSubmissions.map(s => ({
          id: String(s.id),                 // Đồng bộ kiểu string cho component key
          teamName: s.teamName,
          leader: s.leaderName,             // Khớp dữ liệu 'Bùi Thiên Khánh'
          position: s.leaderPosition,       // Khớp dữ liệu 'USER' (hoặc AI Engineer, Dev...)
          memberCount: s.memberCount,       // Khớp số lượng 5
          category: s.categoryName,         // Khớp 'AI/Machine Learning'
          submittedAt: s.sumbittedAt,       // Giữ theo chính tả từ API của bạn
          status: s.scoringStatus,          // 'unscored', 'draft', hoặc 'done'
          score: s.finalScore,              // null hoặc số điểm cụ thể
          scoredAt: s.scoredAt,
          submission: s.submission          // Lấy trọn object lồng nhau { github, video, slide }
        }))

        setRound(formattedRound)
        setSubmissions(formattedSubmissions)
      } catch (err) {
        console.error('Error binding data to UI:', err)
        setError(err.response?.data?.message || 'Không thể tải dữ liệu vòng chấm từ hệ thống.')
      } finally {
        setLoading(false)
      }
    }

    if (roundId) {
      fetchData()
    }
  }, [roundId])

  // Đếm số lượng để đẩy vào cấu phần tiến độ (<JudgeScoringProgress />)
  const stats = submissions.reduce(
    (acc, s) => {
      if (s.status === 'done') acc.done += 1
      else if (s.status === 'draft') acc.draft += 1
      else acc.unscored += 1
      return acc
    },
    { done: 0, draft: 0, unscored: 0 }
  )

  if (loading) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Đang tải..." backLink={backLink} />
        <div className={styles.loadingContainer}>
          <p>Đang tải dữ liệu vòng chấm...</p>
        </div>
      </div>
    )
  }

  if (error || !round) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Lỗi kết nối" backLink={backLink} />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <StickyHeader title={round.name} backLink={backLink} backTooltip="Quay lại trang cuộc thi" />

      <div className={styles.body}>
        <div className={styles.heroRow}>
          <JudgeRoundHero round={round} />
          <JudgeScoringProgress done={stats.done} draft={stats.draft} unscored={stats.unscored} />
        </div>

        <div className={styles.tableRow}>
          <JudgeSubmissionTable submissions={submissions} onScore={handleScore} />
        </div>
      </div>
    </div>
  )
}

export default JudgeRoundDetailPage