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
    // else if (e.discrepancy) { status = 'discrepancy'; score = avg } // Tạm ẩn độ lệch chuẩn
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
  const [awardToAssign, setAwardToAssign] = useState(null)

  const [extendedAwards, setExtendedAwards] = useState([])


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




  //-----------------fetch danh sách giải phụ (chỉ ở vòng chung kết)
 useEffect(() => {
  if (!eventId || !isFinal) {
    setExtendedAwards([])
    return
  }
  const fetchExtendedAwards = async () => {
    try {
      const { data } = await axiosClient.get(`/prize/extended?eventId=${eventId}`)
      setExtendedAwards(
        data.map((p) => ({
          id: p.id,
          label: p.prizeName,
          team: p.teamId ? { id: p.teamId, name: p.teamName } : null,
        }))
      )
    } catch (error) {
      console.error(error)
      setExtendedAwards([])
    }
  }
  fetchExtendedAwards()
}, [eventId, isFinal])


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
        // Giữ nguyên API gốc của bạn
        const { data } = await axiosClient.get(`/round/${roundId}/results?${trackParam.slice(1)}`)

        // 1. [GIỮ NGUYÊN] Đổ toàn bộ data JSON vào state độc nhất của bạn để SHOW danh sách
        setRoundResult(data)

        // 2. [BỔ SUNG] Khôi phục Stage từ trường data.publishStage trong JSON vừa nhận
        if (data) {
          const backendStage = data.publishStage || 1;

          // Khôi phục Stage hiển thị nút bấm (Dùng Key [roundId] theo hàm gốc của bạn)
          setStageByRound((p) => ({
            ...p,
            [roundId]: backendStage
          }));

          // Khôi phục lại hộp đếm ngược thời gian nếu đang ở Stage 2
          if (backendStage === 2) {
            setReviewOverride((rp) => ({
              ...rp,
              [roundId]: {
                remainingSec: WINDOW_SEC,
                durationMin: 30,
                pendingRequests: 0,
                // Đếm số lượng giám khảo từ mảng data.judges có trong JSON
                judgesAgreed: data.judges ? data.judges.length : 0,
                judgesTotal: data.judges ? data.judges.length : 0
              },
            }));
          } else {
            // Nếu ở Stage 1 hoặc 3 thì xóa đi để ẩn đồng hồ đếm ngược
            setReviewOverride((rp) => {
              const updated = { ...rp };
              delete updated[roundId];
              return updated;
            });
          }
        }

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

  const unassignedAwardsCount = isFinal ? extendedAwards.filter(a => !a.team).length : 0

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
    // { key: 'discrepancy', label: 'Cần rà soát', count: counts.discrepancy, tone: 'orange', icon: Scales },
    { key: 'violation', label: 'Vi phạm', count: counts.violation, tone: 'orange', icon: Flag },
  ]

  const judges = isAll || !roundResult ? [] : (roundResult.judges || [])

  // -- Handlers --
  const handleForce = () => setForcedRounds((p) => ({ ...p, [roundId]: true }))


  const handleAdvance = async () => {
    // Xác định trackId hiện tại để gửi lên Backend, nếu chọn "Tất cả" thì truyền chuỗi 'all' hoặc xử lý tùy BE
    const trackId = categoryId === 'all' ? 'all' : categoryId;

    // Lấy stage hiện tại từ state dựa theo Key roundId gốc của bạn
    const currentStage = stageByRound[roundId] || 1;
    const nextStage = Math.min(3, currentStage + 1);

    if (currentStage === 3) return;

    try {
      // 1. Gọi API lưu trạng thái ở Backend trước
      await axiosClient.post(`/round/${roundId}/publish/stage/${nextStage}?trackId=${trackId}`);
      console.log(`Backend cập nhật thành công Stage ${nextStage} cho Track ${trackId}`);

      // 2. Khi API thành công, chạy đúng logic set state đồng bộ ban đầu của bạn
      setStageByRound((p) => {
        const next = (p[roundId] || 1) + 1;

        if ((p[roundId] || 1) === 1) {
          setReviewOverride((rp) => ({
            ...rp,
            [roundId]: {
              remainingSec: WINDOW_SEC,
              durationMin: 30,
              pendingRequests: 0,
              judgesAgreed: judges.length,
              judgesTotal: judges.length
            },
          }));
        }

        return { ...p, [roundId]: Math.min(3, next) };
      });

    } catch (error) {
      console.error("Lỗi khi gọi API advance:", error);
      alert("Không thể cập nhật trạng thái lên hệ thống, vui lòng thử lại!");
    }
  };

  const handleRollback = async () => {
    const trackId = categoryId === 'all' ? 'all' : categoryId;

    const currentStage = stageByRound[roundId] || 1;
    const prevStage = Math.max(1, currentStage - 1);

    if (currentStage === 1) return;

    try {
      // 1. Gọi API báo giảm cấp độ xuống Backend
      await axiosClient.post(`/round/${roundId}/track/${trackId}/publish/stage/${prevStage}`);
      console.log(`Backend rollback thành công về Stage ${prevStage} cho Track ${trackId}`);

      // 2. Cập nhật state quay lùi lại y hệt cấu trúc gốc của bạn
      setStageByRound((p) => {
        const prev = (p[roundId] || 1) - 1;
        return { ...p, [roundId]: Math.max(1, prev) };
      });

      // Reset lại màn hình đếm ngược review nếu quay ngược hẳn về Stage 1
      if (prevStage === 1) {
        setReviewOverride((rp) => {
          const updated = { ...rp };
          delete updated[roundId];
          return updated;
        });
      }

    } catch (error) {
      console.error("Lỗi khi gọi API rollback:", error);
      alert("Không thể lùi trạng thái công bố, vui lòng thử lại!");
    }
  };


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
          extended={extendedAwards}
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
            allRoundsData={{}} /* TODO: cần API tổng hợp theo round nếu ScoringOverview dùng cho view "Tất cả" */
            onOpenAudit={openAudit}
            onOpenScoring={openScoring}
          />
        </div>
      </div>

      <TeamDetailModal open={!!detail} team={detail} eventId={eventId} roundId={roundId} onClose={() => setDetail(null)} />

     {awardToAssign && (
  <AssignAwardModal
    open={true}
    award={awardToAssign}
    teams={standings.map(s => s.team)}
    onClose={() => setAwardToAssign(null)}
    onAssign={async (prizeId, team) => {
      try {
        await axiosClient.put(`/prize/${prizeId}/assign`, { teamId: team.id })
        setExtendedAwards((prev) =>
          prev.map((a) => (a.id === prizeId ? { ...a, team } : a))
        )
      } catch (error) {
        console.error(error)
        alert('Không thể gán giải, vui lòng thử lại!')
      } finally {
        setAwardToAssign(null)
      }
    }}
  />
)}
    </div>
  )
}

export default ResultsTab