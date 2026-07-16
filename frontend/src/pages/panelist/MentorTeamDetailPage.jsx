import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import StickyHeader from '../../components/shared/StickyHeader'
import TeamDetailHero from '../../components/panelist/event/mentorTeamDetail/TeamDetailHero'
import TeamSupportBox from '../../components/panelist/event/mentorTeamDetail/TeamSupportBox'
import RoundTimeline from '../../components/panelist/event/mentorTeamDetail/RoundTimeline'
import TeamStatsBox from '../../components/panelist/event/mentorTeamDetail/TeamStatsBox'
import styles from './MentorTeamDetailPage.module.css'

/* // ── Mock tạm để xem giao diện — thay bằng data thật từ API ──
const mockTeam = {
  id: 't-ledgerlink',
  name: 'LedgerLink',
  category: 'AI Agents for Software Innovation',
  members: [
    { id: 'm1', name: 'Nguyễn Thành Thái', position: 'Trưởng nhóm', isLeader: true },
    { id: 'm2', name: 'Hồ Ngọc Bảo Trân', position: 'Frontend' },
    { id: 'm3', name: 'Bùi Thiên Khánh', position: 'Frontend' },
    { id: 'm4', name: 'Mạc Minh Tùng', position: 'AI Engineer' },
    { id: 'm5', name: 'Phạm Khắc Đăng Khoa', position: 'Design' },
  ],
  kpi: {
    rank: 2,
    totalTeams: 18,
    latestScore: 8.63,
    roundsDone: 2,
    roundsTotal: 3,
    pendingQuestions: 1,
  },
  rounds: [
    {
      id: 'r1',
      ordinal: 1,
      name: 'Vòng sơ loại',
      timeStart: '2026-06-20',
      timeEnd: '2026-06-25',
      lifecycle: 'ended',
      late: false,
      hasSubmission: true,
      result: {
        score: 8.45,
        rank: 3,
        totalTeams: 18,
        status: 'passed',
        label: 'Đi tiếp',
      },
      neighbors: [
        { rank: 2, name: 'FinFlow', score: 8.52 },
        { rank: 3, name: 'LedgerLink', score: 8.45, isSelf: true },
        { rank: 4, name: 'PayNova', score: 8.31 },
      ],
      submission: {
        github: { url: 'https://github.com/facebook/react' },
        slide: { url: 'https://docs.google.com/' },
        video: { url: 'https://www.youtube.com/' },
      },
    },
    {
      id: 'r2',
      ordinal: 2,
      name: 'Vòng đối đầu (phụ)',
      timeStart: '2026-07-01',
      timeEnd: '2026-07-10',
      lifecycle: 'ended',
      late: true,
      hasSubmission: true,
      result: {
        score: 6.20,
        rank: 15,
        totalTeams: 18,
        status: 'failed',
        label: 'Dừng bước',
      },
      neighbors: [
        { rank: 14, name: 'CodeCrafters', score: 6.50 },
        { rank: 15, name: 'LedgerLink', score: 6.20, isSelf: true },
        { rank: 16, name: 'DataMiners', score: 5.90 },
      ],
      submission: {
        github: { url: 'https://github.com/vitejs/vite' },
        slide: { url: 'https://docs.google.com/' },
        video: { fileUrl: '' },
      },
    },
    {
      id: 'r3',
      ordinal: 3,
      name: 'Vòng bán kết',
      timeStart: '2026-07-12',
      timeEnd: '2026-07-15',
      lifecycle: 'active',
      late: false,
      hasSubmission: false,
      result: null,
      neighbors: [],
      submission: {},
    },
    {
      id: 'r4',
      ordinal: 4,
      name: 'Vòng chung kết',
      timeStart: '2026-07-20',
      timeEnd: '2026-07-25',
      lifecycle: 'upcoming',
      late: false,
      hasSubmission: false,
      result: null,
      neighbors: [],
      submission: {},
    },
  ],
  requests: [
    {
      id: 'q1',
      question: 'Nhờ mentor review kiến trúc hệ thống trước buổi demo chung kết.',
      createdAt: '2026-07-09T13:12:00',
    },
    {
      id: 'q2',
      question: 'Cho đội hỏi tiêu chí chấm phần tích hợp thanh toán ở vòng chung kết ạ?',
      createdAt: '2026-07-08T22:40:00',
      answer: 'Phần tích hợp thanh toán chiếm 20%, tập trung vào tính ổn định và trải nghiệm giao dịch.',
      answeredAt: '2026-07-09T02:15:00',
    },
  ],
  stats: {
    avgScore: 8.54,
    bestRank: 2,
    totalTeams: 18,
    questionsTotal: 2,
    questionsAnswered: 1,
  },
  scoreByRound: [
    { label: 'Sơ loại', score: 8.45 },
    { label: 'Bán kết', score: 8.63, current: true },
    { label: 'Chung kết', score: null },
  ],
}
*/

/**
 * MentorTeamDetailPage — trang mentor theo dõi chi tiết một đội.
 * Full-width; gồm hero + KPI, box hỗ trợ, timeline vòng thi và side box thống kê.
 */
function MentorTeamDetailPage() {
  const { eventId, teamId } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTeamDetail() {
      try {
        setLoading(true)
        const [detailRes, resultsRes] = await Promise.all([
          axiosClient.get(`/team/teams/${teamId}`),
          axiosClient.get(`/team-results/events/${eventId}/teams/${teamId}/results`),
        ])

        const detail = detailRes.data
        const roundResults = resultsRes.data

        const mappedTeam = {
          id: detail.teamId,
          name: detail.teamName,
          category: detail.trackName || 'Chưa phân loại',
          members: detail.members.map((m) => ({
            id: m.id,
            name: m.name,
            position: m.role,
            isLeader: m.role === 'LEADER', // sửa theo đúng value enum MemberRole
          })),
          rounds: roundResults.map((r) => ({
            id: String(r.roundId),
            ordinal: r.ordinalNumber,
            name: r.roundName,
            timeStart: r.timeStart,
            timeEnd: r.timeEnd,
            lifecycle: r.teamTotalScore != null ? 'ended' : 'upcoming', // TODO: cần logic chuẩn hơn
            late: r.late,
            hasSubmission: !!r.submission,
            result: r.teamTotalScore != null ? {
              score: r.teamTotalScore,
              rank: r.teamRank?.rank,
              totalTeams: r.teamRank?.totalTeams,
            } : null,
            neighbors: (r.neighbors || []).map((n) => ({
              rank: n.rank,
              name: n.teamName,
              score: n.score,
              isSelf: n.isSelf,
            })),
            submission: r.submission ? {
              github: { url: r.submission.githubUrl },
              slide: { url: r.submission.documentUrl },
              video: { url: r.submission.demoUrl },
            } : {},
          })),
          requests: [], // TODO: chưa có API
        }

        setTeam(mappedTeam)
      } catch (err) {
        console.error(err)
        setError('Có lỗi xảy ra khi tải dữ liệu đội.')
      } finally {
        setLoading(false)
      }
    }
    fetchTeamDetail()
  }, [eventId, teamId])



  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải thông tin đội...</div>
  }

  if (error || !team) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error || 'Không tìm thấy thông tin.'}</div>
  }

  const supportTeam = { id: team.id, name: team.name }

  function handleReply(requestId, text) {
    // TODO: gọi API gửi phản hồi. Hiện mock chỉ log.
    console.log('reply', requestId, text)
  }

  return (
    <div className={styles.page}>
      <StickyHeader
        title={team.name}
        backLink={`/panelist/events/${eventId}?tab=mentor`}
        backTooltip="Quay lại danh sách đội"
      />

      <div className={styles.body}>
        {/* Hero + KPI */}
        <TeamDetailHero team={team} />

        {/* Box hỗ trợ ngay dưới hero */}
        <TeamSupportBox
          team={supportTeam}
          requests={team.requests}
          onSubmitReply={handleReply}
        />

        {/* Chia màn hình: timeline | side box thống kê */}
        <div className={styles.split}>
          <main className={styles.main}>
            <RoundTimeline rounds={team.rounds} />
          </main>
          <aside className={styles.sidebar}>
            <div className={styles.stickyWrap}>
              <TeamStatsBox stats={team.stats} scoreByRound={team.scoreByRound} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default MentorTeamDetailPage
