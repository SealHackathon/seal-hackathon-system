import { useState, useMemo } from 'react'
import Button from '../../shared/Button'
import FilterTabs from '../../shared/SearchFilterBar/FilterTabs'
import { ClockCounterClockwise, Pen, ChartBar, UsersThree, SealCheck, Clock, Flag, ProhibitInset } from '@phosphor-icons/react'
import styles from './ScoringOverview.module.css'

// -- Tong quan cham diem: chip loc gon + card tung giam khao (scroll ngang) --
// props: judges[{id,name,assigned,scored}], roundIsAll, allRoundsData, onOpenAudit, onOpenScoring

function judgeState(jd) {
  if (jd.assigned > 0 && jd.scored >= jd.assigned) return 'done'
  if (jd.scored > 0) return 'scoring'
  return 'idle'
}

const STATE_LABEL = { done: 'Hoàn tất', scoring: 'Đang chấm', idle: 'Chưa chấm' }

function ScoringOverview({ judges, roundIsAll, allRoundsData, onOpenAudit, onOpenScoring }) {
  const [jFilter, setJFilter] = useState('all')

  // Tính toán danh sách giám khảo và gom nhóm
  const { flatJudges, grouped } = useMemo(() => {
    if (!roundIsAll) {
      return { flatJudges: judges || [], grouped: null }
    }
    // Nếu là tất cả vòng
    const groups = []
    const flat = []
    if (allRoundsData) {
      Object.values(allRoundsData).forEach(round => {
        if (round.judges && round.judges.length > 0) {
          // Lưu tên vòng từ ROUNDS array? 
          // allRoundsData có key là id, nhưng ta ko có tên rõ. Ta có thể hardcode hoặc lấy tạm
          // Wait, DATA doesn't have round name directly inside the round object in mock.
          // Tạm lấy key làm title hoặc truyền ROUNDS vào.
          groups.push({ key: round, judges: round.judges })
          flat.push(...round.judges)
        }
      })
    }
    return { flatJudges: flat, grouped: groups }
  }, [judges, roundIsAll, allRoundsData])

  // Lọc giám khảo theo bộ lọc
  const filterJudges = (list) => {
    if (jFilter === 'all') return list
    if (jFilter === 'violation') return [] // Dummy vì mock data ko có trạng thái violation cho BGK
    return list.filter(jd => judgeState(jd) === jFilter)
  }

  // Đếm số lượng cho filter
  const counts = useMemo(() => {
    const c = { all: flatJudges.length, done: 0, scoring: 0, idle: 0, violation: 0 }
    flatJudges.forEach(jd => {
      c[judgeState(jd)]++
    })
    return c
  }, [flatJudges])

  const JUDGE_FILTERS = [
    { key: 'all', label: 'Tất cả', icon: <UsersThree size={16} weight="fill" /> },
    { key: 'done', label: 'Hoàn tất', icon: <SealCheck size={16} weight="fill" /> },
    { key: 'scoring', label: 'Đang chấm', icon: <Clock size={16} weight="fill" /> },
    { key: 'idle', label: 'Chưa chấm', icon: <ProhibitInset size={16} weight="fill" /> },
    { key: 'violation', label: 'Vi phạm', icon: <Flag size={16} weight="fill" /> },
  ]

  const renderJudgeCard = (jd) => {
    const st = judgeState(jd)
    const cls = [styles.jCard, st === 'done' ? styles.jDone : st === 'scoring' ? styles.jScoring : styles.jIdle].join(' ')
    const pct = jd.assigned > 0 ? Math.round((jd.scored / jd.assigned) * 100) : 0
    const barStyle = { width: pct + '%' }
    return (
      <div className={cls} key={jd.id}>
        <div className={styles.jTop}>
          <span className={styles.jName}>{jd.name}</span>
          <span className={styles.jState}>{STATE_LABEL[st]}</span>
        </div>
        <div className={styles.jTrack}><div className={styles.jFill} style={barStyle} /></div>
        <span className={styles.jCount}>{jd.scored}/{jd.assigned} đội</span>
      </div>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <ChartBar size={32} weight="fill" className={styles.titleIcon} />
            <h3 className={styles.title}>Tổng quan chấm điểm</h3>
          </div>
          <span className={styles.subtitle}>Lọc nhanh trạng thái chấm của giám khảo.</span>
        </div>
        <div className={styles.actions}>
          <Button
            label="Nhật ký thao tác"
            icon={ClockCounterClockwise} 
            variant="outline" color='blue'
            labelSize="0.85rem"
            onClick={onOpenAudit} />
          <Button
            label="Chi tiết điểm"
            icon={Pen} iconWeight='fill' 
            variant="outline" color="blue"
            labelSize="0.85rem"
            onClick={onOpenScoring} />
        </div>
      </div>

      <div style={{ marginTop: '-0.2em', marginBottom: '0.2em' }}>
        <FilterTabs filters={JUDGE_FILTERS} countByKey={counts} activeKey={jFilter} onChange={setJFilter} />
      </div>

      {!roundIsAll ? (
        <div className={styles.judges}>
          {filterJudges(flatJudges).map(renderJudgeCard)}
        </div>
      ) : (
        <div>
          {grouped.map((g, i) => {
            const filtered = filterJudges(g.judges)
            if (filtered.length === 0) return null
            return (
              <div key={i} className={styles.roundGroup}>
                <div className={styles.roundTitle}>Vòng thi {i + 1}</div>
                <div className={styles.judges}>
                  {filtered.map(renderJudgeCard)}
                </div>
              </div>
            )
          })}
          {filterJudges(flatJudges).length === 0 && (
            <p className={styles.note}>Không có giám khảo nào khớp với bộ lọc.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default ScoringOverview
