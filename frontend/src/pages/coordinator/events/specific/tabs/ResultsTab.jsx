import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListChecks, Gavel, SealCheck, Scales, Flag, Clock } from '@phosphor-icons/react'
import RoundStepper from '../../../../../components/coordinator/roundResults/RoundStepper'
import CategoryFilter from '../../../../../components/coordinator/roundResults/CategoryFilter'
import PublishFlow from '../../../../../components/coordinator/roundResults/PublishFlow'
import ScoringOverview from '../../../../../components/coordinator/roundResults/ScoringOverview'
import ResultsLeaderboard from '../../../../../components/coordinator/roundResults/ResultsLeaderboard'
import TeamDetailModal from '../../../../../components/coordinator/roundResults/TeamDetailModal'
import AssignAwardModal from '../../../../../components/coordinator/roundResults/AssignAwardModal'
import AwardsSection from '../../../../../components/coordinator/roundResults/AwardsSection'
import { ROUNDS, CATEGORIES, DATA } from './roundResultsMock'
import styles from './ResultsTab.module.css'

// -- Body cho tab "Điểm & Kết quả" trong trang quản lý sự kiện --

const DEFAULT_STAGES = { soloai: 3, doidau: 3, semifinal: 1, final: 2 }
const WINDOW_SEC = 30 * 60

// ---- Helpers tinh toan xep hang ----
const mean = (arr) => arr.reduce((s, n) => s + n, 0) / arr.length
const round2 = (n) => Math.round(n * 100) / 100

function avgOf(entry) {
  const totals = (entry.perJudge || []).filter((j) => j.submitted).map((j) => j.total)
  if (totals.length === 0) return null
  return round2(mean(totals))
}

// Tao danh sach xep hang tu cac entry cua 1 vong
function computeStandings(entries, forced) {
  if (!entries) return []
  const rows = entries.map((e) => {
    const judges = e.perJudge || []
    const submitted = judges.filter((j) => j.submitted)
    const allSubmitted = submitted.length === judges.length && judges.length > 0
    const avg = avgOf(e)
    let status = 'pending'
    let score = null
    if (e.ended === 'eliminated') status = 'eliminated'
    else if (e.ended === 'withdrawn') status = 'withdrawn'
    else if (e.violation) { status = 'violation'; score = avg }
    else if (e.discrepancy) { status = 'discrepancy'; score = avg }
    else if (allSubmitted) { status = 'official'; score = avg }
    else if (forced && avg != null) { status = 'provisional'; score = avg }
    else { status = 'pending'; score = null }
    return {
      team: { id: e.team.id, name: e.team.name },
      status,
      score,
      rank: null,
      tie: false,
      tieBreakNote: e.tieBreakNote || null,
      discrepancy: e.discrepancy || null,
      violation: e.violation || null,
      perJudge: e.perJudge || [],
    }
  })

  const rankable = rows.filter((r) => r.score != null && r.status !== 'eliminated' && r.status !== 'withdrawn')
  const pending = rows.filter((r) => r.score == null && r.status !== 'eliminated' && r.status !== 'withdrawn')
  const ended = rows.filter((r) => r.status === 'eliminated' || r.status === 'withdrawn')

  rankable.sort((a, b) => b.score - a.score)
  let lastScore = null
  let lastRank = 0
  rankable.forEach((r, i) => {
    if (lastScore != null && Math.abs(r.score - lastScore) < 0.005) {
      r.rank = lastRank
      r.tie = true
      const prev = rankable[i - 1]
      if (prev) prev.tie = true
    } else {
      r.rank = i + 1
      lastRank = r.rank
    }
    lastScore = r.score
  })

  return [...rankable, ...pending, ...ended]
}

// Tong hop diem trung binh official across rounds (cho option "Tat ca")
function computeOverall() {
  const acc = {}
  Object.keys(DATA).forEach((rk) => {
    const round = DATA[rk]
    if (!round.official) return
    round.official.forEach((o) => {
      if (!acc[o.id]) acc[o.id] = { id: o.id, name: o.name, totals: [] }
      acc[o.id].totals.push(o.total)
    })
  })
  const rows = Object.values(acc).map((t) => ({
    team: { id: t.id, name: t.name },
    status: 'official',
    score: round2(mean(t.totals)),
    rank: null,
    tie: false,
    tieBreakNote: null,
    discrepancy: null,
    violation: null,
  }))
  rows.sort((a, b) => b.score - a.score)
  rows.forEach((r, i) => { r.rank = i + 1 })
  return rows
}

function ResultsTab() {
  const navigate = useNavigate()
  const params = useParams()
  const eventId = params.eventId || 'demo'

  const [roundId, setRoundId] = useState('semifinal')
  const [categoryId, setCategoryId] = useState('all')
  const [forcedRounds, setForcedRounds] = useState({})
  const [stageByRound, setStageByRound] = useState(DEFAULT_STAGES)
  const [reviews, setReviews] = useState(() => {
    const init = {}
    Object.keys(DATA).forEach((k) => { if (DATA[k].review) init[k] = { ...DATA[k].review } })
    return init
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [awardToAssign, setAwardToAssign] = useState(null)

  const isAll = roundId === 'all'
  const round = isAll ? null : DATA[roundId]
  const roundMeta = ROUNDS.find((r) => r.id === roundId)
  const isFinal = roundMeta ? roundMeta.isFinal : false
  const stage = stageByRound[roundId] || 1

  // -- Dem nguoc cua so phan hoi 30 phut khi dang o giai doan 2 --
  useEffect(() => {
    if (isAll || stage !== 2 || !reviews[roundId]) return
    const id = setInterval(() => {
      setReviews((prev) => {
        const cur = prev[roundId]
        if (!cur || cur.remainingSec <= 0) return prev
        return { ...prev, [roundId]: { ...cur, remainingSec: cur.remainingSec - 1 } }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isAll, stage, roundId, reviews])

  // -- Xep hang --
  const standings = useMemo(() => {
    if (isAll) return computeOverall()
    return computeStandings(round.entries, forcedRounds[roundId])
  }, [isAll, round, roundId, forcedRounds])

  const allResultsReady = standings.every((r) => r.status !== 'pending')
  const blockers = standings.filter((r) => r.status === 'pending').map((r) => r.team.name)
  
  const unassignedAwardsCount = isFinal && round.awards ? (
    (round.awards.main?.filter(a => !a.team).length || 0) +
    (round.awards.extended?.filter(a => !a.team).length || 0)
  ) : 0

  const canForce = !isAll && !allResultsReady
  const allOfficial = standings.length > 0 && standings.every((r) => ['official', 'eliminated', 'withdrawn'].includes(r.status))

  // -- Bo loc theo hanh dong BGK (chip) --
  const counts = useMemo(() => {
    const c = { all: standings.length, official: 0, provisional: 0, discrepancy: 0, violation: 0 }
    standings.forEach((r) => { if (c[r.status] != null) c[r.status] += 1 })
    return c
  }, [standings])

  const filters = [
    { key: 'all', label: 'Tất cả', count: counts.all, tone: 'blue', icon: ListChecks },
    { key: 'official', label: 'Đã chốt điểm', count: counts.official, tone: 'green', icon: SealCheck },
    { key: 'provisional', label: 'Tạm tính', count: counts.provisional, tone: 'orange', icon: Clock },
    { key: 'discrepancy', label: 'Cần rà soát', count: counts.discrepancy, tone: 'orange', icon: Scales },
    { key: 'violation', label: 'Vi phạm', count: counts.violation, tone: 'orange', icon: Flag },
  ]

  const judges = isAll || !round ? [] : (round.judges || [])
  const review = isAll ? null : reviews[roundId]

  // -- Handlers --
  const handleForce = () => setForcedRounds((p) => ({ ...p, [roundId]: true }))
  const handleAdvance = () => {
    setStageByRound((p) => {
      const next = (p[roundId] || 1) + 1
      if ((p[roundId] || 1) === 1) {
        setReviews((rp) => ({
          ...rp,
          [roundId]: rp[roundId]
            ? { ...rp[roundId], remainingSec: WINDOW_SEC }
            : { remainingSec: WINDOW_SEC, pendingRequests: 0, judgesAgreed: judges.length, judgesTotal: judges.length },
        }))
      }
      return { ...p, [roundId]: Math.min(3, next) }
    })
  }
  const handleRollback = () => setStageByRound((p) => ({ ...p, [roundId]: Math.max(1, (p[roundId] || 1) - 1) }))
  const gotoViolation = (team) => navigate('/admin/coordinator/events/' + eventId + '/violations?team=' + team.id)
  const openScoring = () => navigate('/admin/coordinator/events/' + eventId + '/scoring?round=' + roundId)
  const openAudit = () => navigate('/admin/coordinator/events/' + eventId + '/scoring?round=' + roundId + '&tab=audit')

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <h2 className={styles.pageTitle}>Điểm &amp; Kết quả vòng</h2>
        <p className={styles.pageDesc}>
          Theo dõi xếp hạng, kiểm soát chất lượng điểm và công bố kết quả cho từng vòng thi.
        </p>
      </header>

      <div className={styles.filterBar}>
        <RoundStepper rounds={ROUNDS} currentRoundId={roundId} onChange={(id) => { setRoundId(id); setStatusFilter('all') }} />
        <div className={styles.divider} />
        <CategoryFilter categories={CATEGORIES} currentCategoryId={categoryId} onChange={setCategoryId} />
      </div>

      {isFinal && !isAll && (
        <AwardsSection
          main={round.awards ? round.awards.main : []}
          extended={round.awards ? round.awards.extended : []}
          onAssignExtended={(award) => setAwardToAssign(award)}
        />
      )}

      {!isAll && (
        <PublishFlow
          stage={stage}
          review={review}
          allResultsReady={allResultsReady}
          blockers={blockers}
          unassignedAwardsCount={unassignedAwardsCount}
          onAdvance={handleAdvance}
          onRollback={handleRollback}
        />
      )}

      <div className={styles.contentLayout}>
        <div className={styles.leaderboardCol}>
          <ResultsLeaderboard
            rows={standings}
            totalCount={standings.length}
            search={search}
            onSearch={setSearch}
            filter={statusFilter}
            onFilter={setStatusFilter}
            allOfficial={allOfficial}
            onForce={handleForce}
            canForce={canForce}
            onViewDetail={setDetail}
            onResolveViolation={gotoViolation}
            roundIsAll={isAll}
          />
        </div>
        <div className={styles.overviewCol}>
          <ScoringOverview
            judges={judges}
            roundIsAll={isAll}
            allRoundsData={DATA} /* Pass full DATA for grouping */
            onOpenAudit={openAudit}
            onOpenScoring={openScoring}
          />
        </div>
      </div>

      <TeamDetailModal open={!!detail} team={detail} onClose={() => setDetail(null)} />

      {awardToAssign && (
        <AssignAwardModal
          open={true}
          award={awardToAssign}
          teams={standings.map(s => s.team)}
          onClose={() => setAwardToAssign(null)}
          onAssign={(awardId, team) => {
            const aw = round.awards.extended.find(a => a.id === awardId)
            if (aw) aw.team = team
            setAwardToAssign(null) // trigger re-render
          }}
        />
      )}
    </div>
  )
}

export default ResultsTab
