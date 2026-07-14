import { useState, useEffect } from 'react'
import ModalShell from '../../shared/ModalShell'
import axiosClient from '../../../api/axiosClient'
import TeamDetailHero from '../../panelist/event/mentorTeamDetail/TeamDetailHero'
import RoundTimeline from '../../panelist/event/mentorTeamDetail/RoundTimeline'
import TeamStatsBox from '../../panelist/event/mentorTeamDetail/TeamStatsBox'
import { UsersThree } from '@phosphor-icons/react'
import styles from './TeamDetailModal.module.css'

/*
const mockTeamBase = {
  category: 'AI Agents for Software Innovation',
  members: [
    { id: 'm1', name: 'Nguyễn Thành Thái', position: 'Trưởng nhóm', isLeader: true },
    { id: 'm2', name: 'Hồ Ngọc Bảo Trân', position: 'Frontend' },
    { id: 'm3', name: 'Bùi Thiên Khánh', position: 'Frontend' },
    { id: 'm4', name: 'Mạc Minh Tùng', position: 'AI Engineer' },
    { id: 'm5', name: 'Phạm Khắc Đăng Khoa', position: 'Design' },
  ],
  kpi: {
    totalTeams: 18,
    roundsDone: 2,
    roundsTotal: 3,
    pendingQuestions: 1,
  },
  rounds: [
    {
      id: 'r1', ordinal: 1, name: 'Vòng sơ loại', timeStart: '2026-06-20', timeEnd: '2026-06-25',
      lifecycle: 'ended', late: false, hasSubmission: true,
      result: { score: 8.45, rank: 3, totalTeams: 18, status: 'passed', label: 'Đi tiếp' },
      neighbors: [
        { rank: 2, name: 'FinFlow', score: 8.52 },
        { rank: 3, name: 'LedgerLink', score: 8.45, isSelf: true },
        { rank: 4, name: 'PayNova', score: 8.31 },
      ],
      submission: { github: { url: 'https://github.com/facebook/react' }, slide: { url: 'https://docs.google.com/' }, video: { url: 'https://www.youtube.com/' } },
    },
    {
      id: 'r2', ordinal: 2, name: 'Vòng đối đầu (phụ)', timeStart: '2026-07-01', timeEnd: '2026-07-10',
      lifecycle: 'ended', late: true, hasSubmission: true,
      result: { score: 6.20, rank: 15, totalTeams: 18, status: 'failed', label: 'Dừng bước' },
      neighbors: [
        { rank: 14, name: 'CodeCrafters', score: 6.50 },
        { rank: 15, name: 'LedgerLink', score: 6.20, isSelf: true },
        { rank: 16, name: 'DataMiners', score: 5.90 },
      ],
      submission: { github: { url: 'https://github.com/vitejs/vite' }, slide: { url: 'https://docs.google.com/' }, video: { fileUrl: '' } },
    },
    {
      id: 'r3', ordinal: 3, name: 'Vòng bán kết', timeStart: '2026-07-12', timeEnd: '2026-07-15',
      lifecycle: 'active', late: false, hasSubmission: false, result: null, neighbors: [], submission: {},
    },
    {
      id: 'r4', ordinal: 4, name: 'Vòng chung kết', timeStart: '2026-07-20', timeEnd: '2026-07-25',
      lifecycle: 'upcoming', late: false, hasSubmission: false, result: null, neighbors: [], submission: {},
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

// -- Popup xem chi tiet 1 doi. --
function TeamDetailModal({ open, team, eventId, roundId, onClose }) {
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !team || !eventId || !roundId) return

    const fetchTeamInfo = async () => {
      setLoading(true)
      try {
        const { data } = await axiosClient.get(`/team/${eventId}/rounds/${roundId}/teams?currentUserId=0`)
        console.log("Teams fetched from API:", data, "Looking for teamId:", team?.team?.id)
        const foundTeam = data.find(t => t.teamId === team.team?.id)
        if (foundTeam) {
          setTeamData(foundTeam)
        } else {
          setTeamData(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchTeamInfo()
  }, [open, team, eventId, roundId])

  if (!open || !team) return null
  
  // Tạo object fullTeam với giá trị mặc định cho những field chưa có dữ liệu thật
  const fullTeam = {
    id: team.team?.id || 't-unknown',
    name: team.team?.name || 'Tên Đội Thi',
    category: teamData?.trackName || 'Chưa cập nhật',
    members: teamData?.members?.map(m => ({
      id: m.id,
      name: m.name,
      position: m.role === 'LEADER' ? 'Trưởng nhóm' : (m.role || 'Thành viên'),
      isLeader: m.role === 'LEADER' || m.role === 'Trưởng nhóm',
      avatar: m.avatar,
    })) || [],
    kpi: {
      totalTeams: 0,
      roundsDone: 0,
      roundsTotal: 0,
      pendingQuestions: 0,
      rank: team.rank || 0,
      latestScore: team.score || 0,
    },
    rounds: [],
    stats: {
      avgScore: 0,
      bestRank: 0,
      totalTeams: 0,
      questionsTotal: 0,
      questionsAnswered: 0,
    },
    scoreByRound: [],
  }

  return (
    <ModalShell 
      size="full" 
      onClose={onClose}
      title="Thông tin chi tiết đội thi"
      subtitle={fullTeam.name}
      icon={<UsersThree size={26} weight="fill" />}
    >
      <div className={styles.body}>
        {/* Hero + KPI */}
        <TeamDetailHero team={fullTeam} />

        {/* Chia màn hình: timeline | side box thống kê (không có Box Hỗ trợ) */}
        <div className={styles.split}>
          <main className={styles.main}>
            <RoundTimeline rounds={fullTeam.rounds} />
          </main>
          <aside className={styles.sidebar}>
            <div className={styles.stickyWrap}>
              <TeamStatsBox stats={fullTeam.stats} scoreByRound={fullTeam.scoreByRound} />
            </div>
          </aside>
        </div>
      </div>
    </ModalShell>
  )
}

export default TeamDetailModal
