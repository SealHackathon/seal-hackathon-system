import { useState, useMemo, useRef, useCallback } from 'react'
import {
  CaretDown, CaretUp, CaretRight, Flag, Scales, SealCheck,
  HourglassHigh, DownloadSimple, User, Info, ChartBar
} from '@phosphor-icons/react'
import ReactECharts from 'echarts-for-react'
import Button from '../../shared/Button'
import Badge from '../../shared/Badge'
import Tooltip from '../../shared/Tooltip'
import styles from './ScoreTable.module.css'

const fmtScore = (v) => v == null ? '—' : Number(v).toFixed(2)

const JudgeCard = ({ j, pj, criteria, hasScore }) => {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }, [])

  // useEffect(() => {
  //   checkScroll()
  //   window.addEventListener('resize', checkScroll)
  //   return () => window.removeEventListener('resize', checkScroll)
  // }, [checkScroll, pj])
  
  // Need to ensure checkScroll is run after render
  useRef(() => {
     checkScroll()
  })

  return (
    <div className={styles.judgeCardBar}>
      <div className={styles.judgeInfo}>
        <div className={styles.judgeAvatar}>
          <User size={20} weight="fill" color="var(--color-border-blue)" />
        </div>
        <div className={styles.judgeName}>{j.name}</div>
        <div className={styles.judgeTotalWrap}>
          <span className={styles.judgeTotalLabel}>Tổng điểm</span>
          <span className={styles.judgeTotalScore}>
            {hasScore ? fmtScore(pj.total) : '—'}
          </span>
        </div>
      </div>
      
      {hasScore && pj.scores && (
        <div className={styles.scrollContainer}>
          {canScrollLeft && <div className={`${styles.scrollMask} ${styles.maskLeft}`} />}
          {canScrollRight && <div className={`${styles.scrollMask} ${styles.maskRight}`} />}
          <div 
            className={styles.judgeCriteriaWrap} 
            ref={scrollRef} 
            onScroll={checkScroll}
            onMouseEnter={checkScroll}
          >
            {criteria.map(c => {
              const scoreId = c.realId || c.id
              const score = pj.scores[scoreId] != null ? pj.scores[scoreId] : 0
              const scoreFmt = pj.scores[scoreId] != null ? fmtScore(score) : '—'
              const percent = Math.min(100, Math.max(0, (score / 10) * 100))
              
              return (
                <div key={c.id} className={styles.criterionBlock}>
                  <div className={styles.criterionHead}>
                    <span className={styles.criterionLabel}>{c.name}</span>
                    <span className={styles.criterionValue}>{scoreFmt}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ScoreTable — Section ④ Bảng tổng hợp điểm (Làm lại UI/UX)
 * Hỗ trợ Expandable Rows để xem chi tiết điểm từng BGK và tiêu chí
 */
function ScoreTable({
  entries = [], judges = [], tracks = [], criteria = [],
  search = '', highlightJudgeId = null,
  onHighlightJudge, onSelectTeam,  selectedTeamId,
  onOpenScoreEditRequests,
  onOpenViolationRequests,
  onOpenScoreDistribution
}) {
  // Các track đang gập/mở
  const [collapsedTracks, setCollapsedTracks] = useState({})
  
  // Đội đang được mở rộng để xem chi tiết (Expandable Row)
  const [expandedTeamId, setExpandedTeamId] = useState(null)

  const tableRef = useRef(null)

  // For visual testing of exactly 5 criteria
  const displayCriteria = useMemo(() => {
    return [...criteria, ...criteria].slice(0, 5).map((c, idx) => ({ ...c, id: `${c.id}_${idx}`, realId: c.id }))
  }, [criteria])

  const mean = (arr) => arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length

  // Tính weighted avg
  const weightedAvg = (entry) => {
    const submitted = (entry.perJudge || []).filter(j => j.submitted && j.total != null)
    if (submitted.length === 0) return null
    const totals = submitted.map(j => j.total)
    return parseFloat((mean(totals)).toFixed(2))
  }

  // Tính độ lệch (σ)
  const stdDev = (entry) => {
    const submitted = (entry.perJudge || []).filter(j => j.submitted && j.total != null).map(j => j.total)
    if (submitted.length < 2) return null
    const m = mean(submitted)
    const variance = submitted.reduce((s, x) => s + (x - m) ** 2, 0) / submitted.length
    return parseFloat(Math.sqrt(variance).toFixed(2))
  }

  // Lấy trạng thái
  const getStatus = (entry) => {
    if (entry.violation) return 'violation'
    if (entry.discrepancy) return 'discrepancy'
    const all = (entry.perJudge || [])
    if (all.length === 0) return 'pending'
    const submitted = all.filter(j => j.submitted).length
    if (submitted === all.length) return 'done'
    if (submitted > 0) return 'partial'
    return 'pending'
  }

  // Nhóm theo track
  const groupedByTrack = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? entries.filter(e => e.teamName.toLowerCase().includes(q))
      : entries

    const byTrack = {}
    filtered.forEach(e => {
      if (!byTrack[e.trackId]) byTrack[e.trackId] = []
      byTrack[e.trackId].push(e)
    })

    return tracks.filter(t => t.id !== 'all').map(t => {
      const list = (byTrack[t.id] || [])
      const ranked = [...list].sort((a, b) => {
        const aAvg = weightedAvg(a) ?? -1
        const bAvg = weightedAvg(b) ?? -1
        return bAvg - aAvg
      }).map((e, i) => ({ ...e, rank: weightedAvg(e) != null ? i + 1 : null }))
      return { track: t, entries: ranked }
    }).filter(g => g.entries.length > 0)
  }, [entries, tracks, search])

  const toggleTrack = (trackId) => {
    setCollapsedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }))
  }

  const toggleExpandTeam = (teamId) => {
    setExpandedTeamId(prev => prev === teamId ? null : teamId)
  }

  // Xuất CSV chi tiết từng tiêu chí
  const exportCSV = () => {
    const criteriaHeaders = criteria.map(c => `Điểm ${c.name}`)
    const headers = ['Track', 'Đội', 'Giám khảo', 'Tổng điểm BGK', ...criteriaHeaders, 'TB Đội', 'Độ lệch σ', 'Hạng', 'Trạng thái']
    const rows = []
    
    groupedByTrack.forEach(({ track, entries: ents }) => {
      ents.forEach(e => {
        const avg = fmtScore(weightedAvg(e))
        const sd = fmtScore(stdDev(e))
        const rank = e.rank ?? '—'
        const status = getStatus(e)

        judges.forEach(j => {
          const pj = (e.perJudge || []).find(p => p.judgeId === j.id)
          const isSubmitted = pj?.submitted
          const jTotal = isSubmitted ? fmtScore(pj.total) : '—'
          
          const jCriteriaScores = criteria.map(c => {
            if (!isSubmitted || !pj.scores) return '—'
            return pj.scores[c.id] != null ? fmtScore(pj.scores[c.id]) : '—'
          })

          rows.push([track.name, e.teamName, j.name, jTotal, ...jCriteriaScores, avg, sd, rank, status])
        })
      })
    })

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'detailed_scoring.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderProgressBadge = (entry) => {
    const all = (entry.perJudge || [])
    const submitted = all.filter(j => j.submitted).length
    const total = all.length

    if (total === 0) return <Badge variant="grey" label="Chưa chấm" />
    if (submitted === total) {
      return <Badge variant="green" label={`${submitted}/${total} Đã chấm`} icon={<SealCheck weight="fill" />} />
    }
    if (submitted > 0) {
      return <Badge variant="blue" label={`${submitted}/${total} Đang chấm`} />
    }
    return <Badge variant="grey" label="Chưa chấm" />
  }

  const renderFlags = (entry) => {
    const hasViolation = entry.violation
    const hasDiscrepancy = entry.discrepancy
    return (
      <div className={styles.colFlags}>
        {hasViolation && (
          <Tooltip content="Xem yêu cầu xử lí" bgColor="orange">
            <button type="button" className={styles.flagBtn} onClick={(e) => { e.stopPropagation(); if (onOpenViolationRequests) onOpenViolationRequests(entry.teamId); }}>
              <Flag size={24} weight="fill" />
            </button>
          </Tooltip>
        )}
        {hasDiscrepancy && (
          <Tooltip content="Xem yêu cầu chỉnh sửa điểm" bgColor="white" textColor="orangeTxt">
            <button type="button" className={styles.flagBtn} onClick={(e) => { e.stopPropagation(); if (onOpenScoreEditRequests) onOpenScoreEditRequests(entry.teamId); }}>
              <Scales size={24} weight="fill" />
            </button>
          </Tooltip>
        )}
      </div>
    )
  }

  const getRadarOption = (team) => {
    if (!team) return null
    const judgeList = (team.perJudge || []).filter(j => j.submitted && Object.keys(j.scores || {}).length > 0)
    if (judgeList.length === 0) return null

    const criteriaNames = displayCriteria.map(c => c.name)
    const JUDGE_COLORS = [
      '#084CDD', '#0DB04B', '#FF860C', '#7799E3', '#343330',
      '#E91E63', '#9C27B0', '#00BCD4', '#FFC107', '#795548',
      '#607D8B', '#F44336', '#4CAF50', '#FF9800', '#9E9E9E'
    ]
    const radarSeries = judgeList.map(j => ({
      name: judges.find(jx => jx.id === j.judgeId)?.name || 'BGK',
      value: displayCriteria.map(c => j.scores[c.realId] ?? 0),
    }))

    return {
      animation: true,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--color-bg-white)',
        borderColor: 'var(--color-border-blue)',
        borderWidth: 1.5,
        textStyle: { color: 'var(--color-text-primary)', fontSize: 13, fontFamily: 'var(--body-font-main)' },
        padding: [10, 14],
        extraCssText: 'border-radius: var(--inner-radius);'
      },
      legend: {
        type: 'scroll',
        data: radarSeries.map(s => s.name),
        textStyle: { color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--body-font-main)' },
        bottom: 0,
        padding: [0, 20],
        icon: 'circle'
      },
      radar: {
        indicator: criteriaNames.map(name => ({ name, max: 10 })),
        radius: '65%',
        center: ['50%', '50%'],
        axisName: { color: 'var(--color-dark-blue)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--body-font-main)' },
        splitLine: { lineStyle: { color: 'var(--color-border-blue)' } },
        splitArea: { areaStyle: { color: ['var(--color-bg-blue)', 'var(--color-bg-white)'] } },
        axisLine: { lineStyle: { color: 'var(--color-border-blue)' } },
      },
      series: [{
        type: 'radar',
        data: radarSeries.map((s, i) => ({
          ...s,
          lineStyle: { color: JUDGE_COLORS[i % JUDGE_COLORS.length], width: 2.5 },
          itemStyle: { color: JUDGE_COLORS[i % JUDGE_COLORS.length] },
          areaStyle: { color: JUDGE_COLORS[i % JUDGE_COLORS.length], opacity: 0.1 },
        })),
      }],
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.head}>
        <h3 className={styles.title}>Bảng điểm chi tiết</h3>
        <div className={styles.headRight}>
          <Badge variant="blueSolid" size="lg" label={`${entries.length} đội · ${judges.length} BGK`} />
          <Button 
            variant="outline" 
            color="blue" 
            icon={DownloadSimple} 
            label="Xuất file chi tiết" 
            labelSize={14}
            iconSize={18}
            onClick={exportCSV} 
          />
        </div>
      </div>

      <div className={styles.tableWrap} ref={tableRef}>
        {groupedByTrack.length === 0 && (
          <div className={styles.empty}>Không có đội nào khớp với bộ lọc.</div>
        )}

        {groupedByTrack.map(({ track, entries: ents }) => {
          const isCollapsed = !!collapsedTracks[track.id]
          const doneCount = ents.filter(e => getStatus(e) === 'done').length

          return (
            <div key={track.id} className={styles.trackGroup}>
              {/* Track Header */}
              <button type="button" className={styles.trackHeader} onClick={() => toggleTrack(track.id)}>
                <span className={styles.trackCaret}>
                  {isCollapsed ? <CaretRight size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                </span>
                <span className={styles.trackName}>{track.name}</span>
                <Badge variant="blue" label={`${ents.length} đội`} />
                <Badge variant="blue" label={`${judges.length} BGK`} />
              </button>

              {/* Rows */}
              {!isCollapsed && (
                <div className={styles.trackBody}>
                  {/* Table Header cho Track */}
                  <div className={styles.row + ' ' + styles.rowHeader}>
                    <span className={styles.colRank}>Hạng</span>
                    <span className={styles.colTeam}>Đội thi</span>
                    <span className={styles.colStatus}>Tiến độ chấm</span>
                    <span className={styles.colFlags}>Cảnh báo</span>
                    <span className={styles.colAvg}>Điểm trung bình</span>
                    <span className={styles.colDev}>Độ lệch (σ)</span>
                    <span className={styles.colExpand} />
                  </div>

                  {ents.map(entry => {
                    const avg = weightedAvg(entry)
                    const sd = stdDev(entry)
                    const isExpanded = expandedTeamId === entry.teamId
                    const isSelected = selectedTeamId === entry.teamId
                    const radarOption = getRadarOption(entry)

                    return (
                      <div 
                        key={entry.teamId} 
                        className={`${styles.rowWrap} ${isExpanded || isSelected ? styles.rowWrapExpanded : ''}`}
                      >
                        {/* Main Row */}
                        <div 
                          className={styles.row}
                          onClick={() => {
                            toggleExpandTeam(entry.teamId)
                            if (onSelectTeam) onSelectTeam(entry.teamId)
                          }}
                        >
                          <div className={styles.colRank}>
                            {entry.rank != null ? <strong>{entry.rank}</strong> : '—'}
                          </div>
                          <div className={styles.colTeam}>
                            <span className={styles.teamName}>{entry.teamName}</span>
                          </div>
                          <div className={styles.colStatus}>
                            {renderProgressBadge(entry)}
                          </div>
                          <div className={styles.colFlags}>
                            {renderFlags(entry)}
                          </div>
                          <div className={styles.colAvg}>
                            {avg != null ? <span className={styles.avgScore}>{fmtScore(avg)}</span> : '—'}
                          </div>
                          <div className={styles.colDev}>
                            {sd != null ? (
                              <Tooltip content="Xem phân tán điểm" bgColor={sd > 1.0 ? "white" : "blue"} textColor={sd > 1.0 ? "orangeTxt" : undefined}>
                                <button 
                                  type="button"
                                  className={`${styles.devClickable} ${sd > 1.0 ? styles.devHigh : styles.devNormal}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (onOpenScoreDistribution) onOpenScoreDistribution(entry.teamId)
                                  }}
                                >
                                  {sd}
                                  <ChartBar size={16} weight="fill" />
                                </button>
                              </Tooltip>
                            ) : '—'}
                          </div>
                          <div className={styles.colExpand}>
                            {isExpanded ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                          </div>
                        </div>

                        {/* Expanded Detail (Điểm chi tiết của BGK) */}
                        {isExpanded && (
                          <div className={styles.expandedDetail}>
                            <div className={styles.detailLeft}>
                              <h4 className={styles.detailTitle}>Chi tiết điểm từ Ban Giám Khảo</h4>
                              <div className={styles.judgeCards}>
                                {judges.map(j => {
                                  const pj = (entry.perJudge || []).find(p => p.judgeId === j.id)
                                  const hasScore = pj?.submitted
                                  return (
                                    <JudgeCard 
                                      key={j.id} 
                                      j={j} 
                                      pj={pj || {}} 
                                      criteria={displayCriteria} 
                                      hasScore={hasScore} 
                                    />
                                  )
                                })}
                              </div>
                            </div>
                            
                            <div className={styles.detailRight}>
                              {radarOption ? (
                                <ReactECharts 
                                  option={radarOption} 
                                  style={{ height: 450, width: '100%' }} 
                                  opts={{ renderer: 'svg' }} 
                                />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', gap: '0.5rem' }}>
                                  <Info size={32} weight="fill" color="var(--color-border-blue)" />
                                  <span>Chưa có dữ liệu chấm điểm</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScoreTable
