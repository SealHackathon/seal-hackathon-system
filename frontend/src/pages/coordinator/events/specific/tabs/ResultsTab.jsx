import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListChecks, Gavel, SealCheck, Scales, Flag, Clock } from '@phosphor-icons/react'
import RoundStepper from '../../../../../components/coordinator/roundResults/RoundStepper'
import CategoryFilter from '../../../../../components/coordinator/roundResults/CategoryFilter'
import PublishFlow from '../../../../../components/coordinator/roundResults/PublishFlow'
import RequestsSection from '../../../../../components/coordinator/roundResults/RequestsSection'
import ResultsLeaderboard from '../../../../../components/coordinator/roundResults/ResultsLeaderboard'
import TeamDetailModal from '../../../../../components/coordinator/roundResults/TeamDetailModal'
import AssignAwardModal from '../../../../../components/coordinator/roundResults/AssignAwardModal'
import AwardsSection from '../../../../../components/coordinator/roundResults/AwardsSection'
import SubmissionModal from '../../../../../components/panelist/event/mentorTeamDetail/SubmissionModal'
import { ROUNDS, CATEGORIES, DATA } from './roundResultsMock'
import styles from './ResultsTab.module.css'
import axiosClient from '../../../../../api/axiosClient'

// -- Body cho tab "Điểm & Kết quả" trong trang quản lý sự kiện --

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

function ResultsTab() {
  const navigate = useNavigate()
  const params = useParams()
  const eventId = params.eventId || 'demo'

  // ---- TẤT CẢ state khai báo ở đây ----
  const [rounds, setRounds] = useState([])
  const [criteria, setCriteria] = useState([])
  const [categories, setCategories] = useState([])
  const [roundId, setRoundId] = useState(null)
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [roundResult, setRoundResult] = useState(null)
  const [loadingResult, setLoadingResult] = useState(false)
  const [categoryId, setCategoryId] = useState('all')
  const [forcedRounds, setForcedRounds] = useState({})
  const [stageByRound, setStageByRound] = useState({})
  const [reviewOverride, setReviewOverride] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [submissionDetail, setSubmissionDetail] = useState(null)
  const [awardToAssign, setAwardToAssign] = useState(null)

  // ---- Biến derive từ state ----
  const isAll = roundId === 'all'
  const roundMeta = rounds.find((r) => r.id === roundId)
  const isFinal = roundMeta ? roundMeta.isFinal : false
  const stage = stageByRound[roundId] || 1
  const review = reviewOverride[roundId] || roundResult?.review || null

  //-----------------fetch rounds va criterias tu API
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const { data } = await axiosClient.get(`/round?eventId=${eventId}`)

        const mapped = data.map((round) => ({
          id: round.roundId,
          name: round.roundName,
          lifecycle:
            round.status === 'COMPLETED'
              ? 'done'
              : round.status === 'IN_PROGRESS'
                ? 'active'
                : 'upcoming',
          timeStart: round.roundStartTime,
          timeEnd: round.roundEndTime,
          isFinal: round.roundOrdinalNumber === round.roundQuantity,
        }))

        setRounds(mapped)

        if (mapped.length > 0) {
          const active = mapped.find((r) => r.lifecycle === 'active')
          setRoundId((active || mapped[0]).id)

          setCriteria(
            data[0].criteria.map((item) => ({
              id: item.id,
              name: item.name,
              weight: item.weight,
            }))
          )
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingRounds(false)
      }
    }

    if (eventId) {
      fetchRounds()
    }
  }, [eventId])

  //-----------------fetch entries/judges/review/awards cua round dang chon (theo track neu co)
  useEffect(() => {
    if (!roundId || isAll) {
      setRoundResult(null)
      return
    }
    const fetchResult = async () => {
      setLoadingResult(true)
      try {
        const trackParam = categoryId && categoryId !== 'all' ? `&trackId=${categoryId}` : ''
        const { data } = await axiosClient.get(`/round/${roundId}/results?${trackParam.slice(1)}`)
        setRoundResult(data)
      } catch (error) {
        console.error(error)
        setRoundResult(null)
      } finally {
        setLoadingResult(false)
      }
    }
    fetchResult()
  }, [roundId, isAll, categoryId])

  //-----------------fetch tracks/categories tu API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const { data } = await axiosClient.get(`/track?eventId=${eventId}`)
        setCategories([
          { id: 'all', name: 'Tất cả' },
          ...data.map((t) => ({ id: String(t.id), name: t.name })),
        ])
      } catch (error) {
        console.error(error)
      }
    }
    if (eventId) fetchTracks()
  }, [eventId])

  // -- Dem nguoc cua so phan hoi 30 phut khi dang o giai doan 2 --
  useEffect(() => {
    if (isAll || stage !== 2 || !review) return
    const id = setInterval(() => {
      setReviewOverride((prev) => {
        const cur = prev[roundId] || review
        if (!cur || cur.remainingSec <= 0) return prev
        return { ...prev, [roundId]: { ...cur, remainingSec: cur.remainingSec - 1 } }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isAll, stage, roundId, review])

  // -- Xep hang --
  const standings = useMemo(() => {
    if (isAll) return [] // TODO: chưa có API tổng hợp toàn giải
    if (!roundResult) return []
    return computeStandings(roundResult.entries, forcedRounds[roundId])
  }, [isAll, roundResult, roundId, forcedRounds])

  const allResultsReady = standings.length > 0 && standings.every((r) => r.status !== 'pending')
  const blockers = standings.filter((r) => r.status === 'pending').map((r) => r.team.name)

  const unassignedAwardsCount = isFinal && roundResult?.awards ? (
    (roundResult.awards.main?.filter(a => !a.team).length || 0) +
    (roundResult.awards.extended?.filter(a => !a.team).length || 0)
  ) : 0

  const canForce = !isAll && !!roundResult && !allResultsReady
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

  const judges = isAll || !roundResult ? [] : (roundResult.judges || [])

  // -- Handlers --
  const handleForce = () => setForcedRounds((p) => ({ ...p, [roundId]: true }))
  const handleAdvance = () => {
    setStageByRound((p) => {
      const next = (p[roundId] || 1) + 1
      if ((p[roundId] || 1) === 1) {
        setReviewOverride((rp) => ({
          ...rp,
          [roundId]: { remainingSec: WINDOW_SEC, durationMin: 30, pendingRequests: 0, judgesAgreed: judges.length, judgesTotal: judges.length },
        }))
        // TODO: gọi API POST /round/{roundId}/publish/advance để lưu trạng thái ở BE khi có endpoint
      }
      return { ...p, [roundId]: Math.min(3, next) }
    })
  }
  const handleRollback = () => setStageByRound((p) => ({ ...p, [roundId]: Math.max(1, (p[roundId] || 1) - 1) }))
  // TODO: gọi API POST /round/{roundId}/publish/rollback khi có endpoint
  
  const gotoViolation = (team) => navigate('/admin/coordinator/events/' + eventId + '/violations?team=' + team.id)
  const openScoring = () => navigate('/admin/coordinator/events/' + eventId + '/scoring?round=' + roundId)
  const openAudit = () => navigate('/admin/coordinator/events/' + eventId + '/scoring?round=' + roundId + '&tab=audit')

  if (loadingRounds) {
    return <div className={styles.tab}>Đang tải dữ liệu vòng thi...</div>
  }

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <h2 className={styles.pageTitle}>Điểm &amp; Kết quả vòng</h2>
        <p className={styles.pageDesc}>
          Theo dõi xếp hạng, kiểm soát chất lượng điểm và công bố kết quả cho từng vòng thi.
        </p>
      </header>

      <div className={styles.filterBar}>
        <RoundStepper rounds={rounds} currentRoundId={roundId} onChange={(id) => { setRoundId(id); setStatusFilter('all') }} />
        <div className={styles.divider} />
        <CategoryFilter categories={categories} currentCategoryId={categoryId} onChange={setCategoryId} />
      </div>

      {loadingResult && <div className={styles.pageDesc}>Đang tải điểm...</div>}

      {isFinal && !isAll && roundResult && (
        <AwardsSection
          main={roundResult.awards ? roundResult.awards.main : []}
          extended={roundResult.awards ? roundResult.awards.extended : []}
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
          <RequestsSection 
            onOpenTeam={(teamId) => {
               // Mock finding team
               const team = standings.find(s => s.team.id === teamId)?.team || { id: teamId, name: 'FPT.O-H' }
               setDetail(team)
            }}
            onOpenSubmission={(teamId) => {
               // Mock submission data
               setSubmissionDetail({
                 name: 'Vòng sơ loại',
                 submittedAt: '14:00 10/07/2026',
                 late: false,
                 submission: {
                   github: 'https://github.com/fpt-oh',
                   demo: 'https://demo.fpt-oh.com',
                   slide: 'https://docs.google.com/presentation/d/1'
                 }
               })
            }}
          />
          {/* <ScoringOverview
            judges={judges}
            roundIsAll={isAll}
            allRoundsData={{}} 
            onOpenAudit={openAudit}
            onOpenScoring={openScoring}
          /> */}
        </div>
      </div>

      <TeamDetailModal open={!!detail} team={detail} onClose={() => setDetail(null)} />

      {awardToAssign && roundResult && (
        <AssignAwardModal
          open={true}
          award={awardToAssign}
          teams={standings.map(s => s.team)}
          onClose={() => setAwardToAssign(null)}
          onAssign={(awardId, team) => {
            // TODO: gọi API POST /round/{roundId}/awards/{awardId}/assign khi có endpoint
            const aw = roundResult.awards.extended.find(a => a.id === awardId)
            if (aw) aw.team = team
            setAwardToAssign(null)
          }}
        />
      )}

      {submissionDetail && (
        <SubmissionModal 
           open={!!submissionDetail}
           round={submissionDetail}
           onClose={() => setSubmissionDetail(null)}
        />
      )}
    </div>
  )
}

export default ResultsTab