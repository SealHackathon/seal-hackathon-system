import { useState, useMemo, useRef } from 'react'
import { NotePencil, Flag } from '@phosphor-icons/react'
import ScoringOverviewCards from '../../../../../components/coordinator/events/ScoringOverviewCards'
import ScoringFilterBar from '../../../../../components/coordinator/events/ScoringFilterBar'
import ScoreTable from '../../../../../components/coordinator/events/ScoreTable'
import ModalShell from '../../../../../components/shared/ModalShell'
import RequestsSection from '../../../../../components/coordinator/roundResults/RequestsSection'
import ScoreEditModal from '../../../../../components/coordinator/roundResults/ScoreEditModal'
import ViolationHandlingModal from '../../../../../components/coordinator/roundResults/ViolationHandlingModal'
import ScoreDistributionModal from '../../../../../components/coordinator/roundResults/ScoreDistributionModal'
import { mockScoreEditData } from '../../../../../components/coordinator/roundResults/scoreEditMock'
import {
  ROUNDS, TRACKS, JUDGES, CRITERIA, ENTRIES, EVENT_OVERVIEW, DISCREPANCY_LIST
} from './scoringMock'

const mockViolationData = {
  teamId: '',
  teamName: 'FPT.O-H',
  round: 'Vòng sơ loại',
  judgeName: 'Nguyễn Văn A',
  time: '14:30 10/07/2026',
  reason: 'Nghi ngờ sử dụng source code được làm sẵn từ trước, không tuân thủ quy định Hackathon. Cần kiểm tra lại source code của đội này ngay lập tức để đảm bảo công bằng.'
}
import styles from './ScoringTab.module.css'

/**
 * ScoringTab — Tab Chấm điểm trong SpecificEventPage
 * Orchestrator: giữ toàn bộ filter state, điều phối ③↔④
 */
function ScoringTab() {
  // ── Filter state (điều khiển section ③ và ④) ──
  const [roundId, setRoundId] = useState('all')
  const [trackId, setTrackId] = useState('all')
  const [judgeId, setJudgeId] = useState('all')
  const [search, setSearch] = useState('')

  // ── Tương tác ③↔④ ──
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [highlightJudgeId, setHighlightJudgeId] = useState(null)
  const [isScoreEditModalOpen, setIsScoreEditModalOpen] = useState(false)
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false)

  const [directScoreEditTeamId, setDirectScoreEditTeamId] = useState(null)
  const [directViolationTeamId, setDirectViolationTeamId] = useState(null)
  const [scoreDistributionTeamId, setScoreDistributionTeamId] = useState(null)

  // Ref cuộn đến khu vực xử lý requests
  const requestsRef = useRef(null)
  const tableRef = useRef(null)

  const scrollToRequests = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Khi filter vòng thay đổi → reset track
  const handleRoundChange = (id) => {
    setRoundId(id)
    setTrackId('all')
    setSelectedTeamId(null)
  }

  const handleTrackChange = (id) => {
    setTrackId(id)
    setSelectedTeamId(null)
  }

  // ── Lọc entries theo filter ──
  const filteredEntries = useMemo(() => {
    let list = ENTRIES
    // Lọc theo vòng
    if (roundId !== 'all') list = list.filter(e => e.roundId === roundId)
    // Lọc theo track
    if (trackId !== 'all') list = list.filter(e => e.trackId === trackId)
    // Lọc theo BGK (chỉ giữ đội đã được BGK đó chấm)
    if (judgeId !== 'all') list = list.filter(e =>
      (e.perJudge || []).some(j => j.judgeId === judgeId && j.submitted)
    )
    return list
  }, [roundId, trackId, judgeId])

  // ── Judges hiển thị (lấy từ entries đang lọc) ──
  const visibleJudges = useMemo(() => {
    if (judgeId !== 'all') return JUDGES.filter(j => j.id === judgeId)
    return JUDGES
  }, [judgeId])

  // ── Tracks visible (theo vòng đã lọc) ──
  const visibleTracks = useMemo(() => {
    if (roundId === 'all') return TRACKS
    const trackIds = new Set(filteredEntries.map(e => e.trackId))
    return TRACKS.filter(t => t.id === 'all' || trackIds.has(t.id))
  }, [roundId, filteredEntries])

  return (
    <div className={styles.tab}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.pageTitle}>Chấm điểm</h2>
        <p className={styles.pageDesc}>
          Theo dõi tiến độ chấm, phân tích phân bố điểm và phát hiện bất đồng giữa BGK.
        </p>
      </header>

      {/* ① Phần đầu: Tổng quan & Audit Log */}
      <div className={styles.topSection}>
        <div className={styles.overviewWrap}>
          <ScoringOverviewCards
            overview={EVENT_OVERVIEW}
            discrepancyList={DISCREPANCY_LIST}
            onScrollToRequests={scrollToRequests}
            onOpenScoreEditRequests={() => setIsScoreEditModalOpen(true)}
            onOpenViolationRequests={() => setIsViolationModalOpen(true)}
          />
        </div>
      </div>

      {/* ② Filter bar */}
      <ScoringFilterBar
        rounds={ROUNDS}
        tracks={visibleTracks}
        judges={JUDGES}
        roundId={roundId}
        trackId={trackId}
        judgeId={judgeId}
        search={search}
        onRoundChange={handleRoundChange}
        onTrackChange={handleTrackChange}
        onJudgeChange={setJudgeId}
        onSearch={setSearch}
      />

      {/* ④ Bảng tổng hợp */}
      <div ref={tableRef}>
        <ScoreTable
          entries={filteredEntries}
          judges={visibleJudges}
          tracks={visibleTracks}
          criteria={CRITERIA}
          search={search}
          highlightJudgeId={highlightJudgeId}
          onHighlightJudge={setHighlightJudgeId}
          onSelectTeam={(teamId) => {
            setSelectedTeamId(teamId)
          }}
          selectedTeamId={selectedTeamId}
          onOpenScoreEditRequests={(teamId) => {
            if (teamId) setDirectScoreEditTeamId(teamId)
            else setIsScoreEditModalOpen(true)
          }}
          onOpenViolationRequests={(teamId) => {
            if (teamId) setDirectViolationTeamId(teamId)
            else setIsViolationModalOpen(true)
          }}
          onOpenScoreDistribution={(teamId) => setScoreDistributionTeamId(teamId)}
        />
      </div>

      {isScoreEditModalOpen && (
        <ModalShell 
          onClose={() => setIsScoreEditModalOpen(false)}
          size="md"
          title={`Yêu cầu chỉnh điểm (${EVENT_OVERVIEW.pendingScoreEdits})`}
          subtitle="Danh sách các yêu cầu điều chỉnh lại điểm từ Ban giám khảo."
          titleColor="var(--color-primary-green)"
          subtitleColor="var(--color-text-primary)"
          icon={<NotePencil size={24} weight="fill" color="var(--color-primary-green)" />}
        >
          <div style={{ paddingTop: '1em' }}>
            <RequestsSection type="scoreEdit" hideHeader={true} />
          </div>
        </ModalShell>
      )}

      {isViolationModalOpen && (
        <ModalShell 
          onClose={() => setIsViolationModalOpen(false)}
          size="md"
          title={`Xử lí vi phạm (${EVENT_OVERVIEW.pendingViolations})`}
          subtitle="Danh sách các đội thi bị báo cáo vi phạm cần Ban tổ chức xem xét."
          titleColor="var(--color-primary-orange)"
          subtitleColor="var(--color-text-primary)"
          icon={<Flag size={24} weight="fill" color="var(--color-primary-orange)" />}
        >
          <div style={{ paddingTop: '1em' }}>
            <RequestsSection type="violation" hideHeader={true} />
          </div>
        </ModalShell>
      )}

      {/* Direct Modals for specific team requests from ScoreTable */}
      {directScoreEditTeamId && (
        <ScoreEditModal
          isOpen={true}
          onClose={() => setDirectScoreEditTeamId(null)}
          data={{ ...mockScoreEditData, teamId: directScoreEditTeamId, teamName: ENTRIES.find(e => e.teamId === directScoreEditTeamId)?.teamName || 'Team' }}
        />
      )}

      {directViolationTeamId && (
        <ViolationHandlingModal
          isOpen={true}
          onClose={() => setDirectViolationTeamId(null)}
          data={{ ...mockViolationData, teamId: directViolationTeamId, teamName: ENTRIES.find(e => e.teamId === directViolationTeamId)?.teamName || 'Team' }}
        />
      )}

      {scoreDistributionTeamId && (
        <ScoreDistributionModal
          isOpen={true}
          onClose={() => setScoreDistributionTeamId(null)}
          data={{
            teamName: ENTRIES.find(e => e.teamId === scoreDistributionTeamId)?.teamName || 'Team',
            criteria: CRITERIA,
            judges: (ENTRIES.find(e => e.teamId === scoreDistributionTeamId)?.perJudge || []).map(pj => ({
              id: pj.judgeId,
              name: pj.judgeName,
              scores: pj.scores || {}
            }))
          }}
        />
      )}
    </div>
  )
}

export default ScoringTab
