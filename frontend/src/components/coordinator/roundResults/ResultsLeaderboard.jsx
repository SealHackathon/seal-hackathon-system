import { useMemo } from 'react'
import Button from '../../shared/Button'
import Badge from '../../shared/Badge'
import Tooltip from '../../shared/Tooltip'
import FormInput from '../../shared/FormInput'
import FilterTabs from '../../shared/SearchFilterBar/FilterTabs'
import { MagnifyingGlass, Lightning, Eye, Star, Flag, Scales, SealCheck, ProhibitInset, SignOut, Ranking } from '@phosphor-icons/react'
import styles from './ResultsLeaderboard.module.css'

const fmtScore = (v) => (v == null ? '—' : v.toFixed(2))

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'official', label: 'Đã chốt điểm', dot: 'green' },
  { key: 'provisional', label: 'Tạm tính', dot: 'orange' },
  // { key: 'discrepancy', label: 'Cần rà soát', dot: 'orange' },
  { key: 'violation', label: 'Vi phạm', dot: 'orange' },
]

// -- O trang thai: uu tien icon / co thay vi dac chu --
function StatusCell({ row, onResolveViolation }) {
  if (row.status === 'violation') {
    return (
      <Tooltip content="Gắn cờ vi phạm — nhấn để xử lý" bgColor="orange">
        <button type="button" className={styles.flagBtn} onClick={() => onResolveViolation(row.team)}>
          <Flag size={26} weight="fill" />
        </button>
      </Tooltip>
    )
  }
  // Tạm ẩn độ lệch chuẩn
  // if (row.status === 'discrepancy') {
  //   return (
  //     <Tooltip content={'Chênh lệch điểm (lệch chuẩn ' + (row.discrepancy ? row.discrepancy.stdDev : '') + ')'} bgColor="white" textColor='orangeTxt'>
  //       <span className={styles.iconWarn}><Scales size={22} weight="fill" /></span>
  //     </Tooltip>
  //   )
  // }
  if (row.status === 'provisional') {
    return <Badge variant="orange" label="Tạm tính" size="sm" dot={false} />
  }
  if (row.status === 'official') {
    return (
      <Tooltip content="Điểm chính thức" bgColor="green">
        <span className={styles.iconOk}><SealCheck size={22} weight="fill" /></span>
      </Tooltip>
    )
  }
  if (row.status === 'eliminated') {
    return <span className={styles.ended}><ProhibitInset size={20} weight="fill" /> Bị loại</span>
  }
  if (row.status === 'withdrawn') {
    return <span className={styles.ended}><SignOut size={20} weight="bold" /> Rút lui</span>
  }
  return <span className={styles.pending}>Chưa đủ điểm</span>
}

function ResultsLeaderboard({ rows, totalCount, search, onSearch, filter, onFilter, allOfficial, onForce, canForce, onViewDetail, onResolveViolation, roundIsAll }) {
  const countByKey = useMemo(() => {
    const c = { all: rows.length, official: 0, provisional: 0, discrepancy: 0, violation: 0 }
    rows.forEach(r => {
      if (c[r.status] != null) c[r.status] += 1
    })
    return c
  }, [rows])

  const visibleRows = useMemo(() => {
    let list = rows
    if (filter !== 'all') list = list.filter(r => r.status === filter)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(r => r.team.name.toLowerCase().includes(q))
    return list
  }, [rows, filter, search])

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <h3 className={styles.title}>
            <Ranking size={32} weight="fill" color='var(--color-border-blue'/> Bảng xếp hạng
          </h3>
          <span className={styles.count}>{visibleRows.length}/{totalCount} đội</span>
          {allOfficial && !roundIsAll && (
            <Badge variant="greenSolid" label="Đã đủ điểm chính thức" size="sm" dot={false} />
          )}
        </div>
        <div className={styles.headRight}>
          {canForce && (
            <Button label="Tính điểm & xếp hạng ngay" icon={Lightning} variant="outline" iconWeight='fill' color="orange" labelSize="0.9rem" onClick={onForce} />
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <FormInput
            iconLeft={MagnifyingGlass}
            placeholder="Tìm đội thi…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterCol}>
          <FilterTabs filters={STATUS_FILTERS} countByKey={countByKey} activeKey={filter} onChange={onFilter} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.row + ' ' + styles.headerRow}>
          <span className={styles.cHang}>Hạng</span>
          <span className={styles.cTeam}>Đội thi</span>
          <span className={styles.cJudges}>Điểm BGK</span>
          <span className={styles.cScore}>Điểm chính thức</span>
          <span className={styles.cStatus}>Trạng thái</span>
          <span className={styles.cAction} />
        </div>

        {(() => {
          const groupedRows = []
          let currentGroup = []
          let currentRank = null

          visibleRows.forEach((row) => {
            if (row.tie && row.rank != null) {
              if (currentRank === row.rank) {
                currentGroup.push(row)
              } else {
                if (currentGroup.length > 0) groupedRows.push({ isTie: true, rows: currentGroup })
                currentGroup = [row]
                currentRank = row.rank
              }
            } else {
              if (currentGroup.length > 0) {
                groupedRows.push({ isTie: true, rows: currentGroup })
                currentGroup = []
                currentRank = null
              }
              groupedRows.push({ isTie: false, rows: [row] })
            }
          })
          if (currentGroup.length > 0) {
            groupedRows.push({ isTie: true, rows: currentGroup })
          }

          const renderRow = (row) => {
            const muted = row.status === 'eliminated' || row.status === 'withdrawn'
            return (
              <div className={muted ? styles.row + ' ' + styles.rowMuted : styles.row} key={row.team.id}>
                <span className={styles.cHang}>
                  {row.rank ? (
                    <span className={styles.rankWrap}>
                      {row.rank <= 3 && <Star size={20} weight="fill" className={styles['medal' + row.rank]} />}
                      <span className={styles.rankNum}>{row.rank}</span>
                    </span>
                  ) : (
                    <span className={styles.rankNone}>—</span>
                  )}
                </span>

                <span className={styles.cTeam}>
                  <span className={muted ? styles.teamName + ' ' + styles.strike : styles.teamName}>{row.team.name}</span>
                </span>

                <span className={styles.cJudges}>
                  {(row.perJudge || []).map((j, idx) => {
                    const hasSubmitted = j.submitted && j.total != null
                    return (
                      <Tooltip key={idx} content={j.judge} bgColor="blue" textColor="white">
                        {hasSubmitted ? (
                          <span className={styles.judgeBadge}>{fmtScore(j.total)}</span>
                        ) : (
                          <Badge variant="dashedBlue" label="—" size="sm" dot={false} />
                        )}
                      </Tooltip>
                    )
                  })}
                </span>

                <span className={styles.cScore}>
                  {row.score == null ? (
                    <span className={styles.scoreNone}>—</span>
                  ) : (
                    <div className={styles.scoreWrap}>
                      <span className={row.status === 'official' ? styles.scoreVal : styles.scoreTemp}>
                        {fmtScore(row.score)}
                        <span className={styles.scoreMax}>/10</span>
                      </span>
                      {row.tieBreakNote && (() => {
                        // Cắt chuỗi "Hòa 8.10 — tie-break theo..." thành "Tie-break theo..."
                        const noteParts = row.tieBreakNote.split(' — ')
                        const cleanNote = noteParts.length > 1 ? noteParts[1].charAt(0).toUpperCase() + noteParts[1].slice(1) : row.tieBreakNote
                        return (
                          <Tooltip position="left" content={cleanNote} bgColor="white" textColor="blueTxt">
                            <div style={{ marginTop: '2px' }}>
                              <Badge variant="blueSolid" label="Tie-breaking" size="sm" dot={false} />
                            </div>
                          </Tooltip>
                        )
                      })()}
                    </div>
                  )}
                </span>

                <span className={styles.cStatus}>
                  <StatusCell row={row} onResolveViolation={onResolveViolation} />
                </span>

                <span className={styles.cAction}>
                  <Tooltip position='left' content="Xem chi tiết" bgColor="white" textColor='blueTxt'>
                    <Button 
                      variant='outline'
                      icon={Eye} iconWeight='fill' iconSize={18}
                      onClick={() => onViewDetail(row)} />
                  </Tooltip>
                </span>
              </div>
            )
          }

          return groupedRows.map((grp, gIdx) => {
            if (grp.isTie) {
              return (
                <div key={`tie-${gIdx}`} className={styles.tieGroup}>
                  {grp.rows.map(row => renderRow(row))}
                </div>
              )
            }
            return renderRow(grp.rows[0])
          })
        })()}

        {visibleRows.length === 0 && <p className={styles.empty}>Không có đội nào khớp bộ lọc.</p>}
      </div>
    </section>
  )
}

export default ResultsLeaderboard
