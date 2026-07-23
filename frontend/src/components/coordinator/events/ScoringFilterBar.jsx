import { MagnifyingGlass } from '@phosphor-icons/react'
import Dropdown from '../../shared/Dropdown'
import FormInput from '../../shared/FormInput'
import styles from './ScoringFilterBar.module.css'

/**
 * ScoringFilterBar — Section ② Bộ lọc
 * Điều khiển: chart section ③ và bảng ④
 *
 * Props:
 *   rounds      : [{ id, name }]
 *   tracks      : [{ id, name }]
 *   judges      : [{ id, name }]
 *   roundId     : string | 'all'
 *   trackId     : string | 'all'
 *   judgeId     : string | 'all'
 *   search      : string
 *   onRoundChange : (id) => void
 *   onTrackChange : (id) => void
 *   onJudgeChange : (id) => void
 *   onSearch      : (str) => void
 */
function ScoringFilterBar({
  rounds = [], tracks = [], judges = [],
  roundId, trackId, judgeId, search,
  onRoundChange, onTrackChange, onJudgeChange, onSearch,
}) {
  // Chuyển sang format Dropdown options
  const roundOptions = [
    { value: 'all', label: 'Tất cả vòng' },
    ...rounds.map(r => ({ value: r.id, label: r.name })),
  ]

  const trackOptions = [
    { value: 'all', label: 'Tất cả track' },
    ...tracks.filter(t => t.id !== 'all').map(t => ({ value: t.id, label: t.name })),
  ]

  const judgeOptions = [
    { value: 'all', label: 'Tất cả BGK' },
    ...judges.map(j => ({ value: j.id, label: j.name })),
  ]

  return (
    <div className={styles.bar}>
      {/* Vòng thi */}
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>Vòng</span>
        <Dropdown
          value={roundId}
          options={roundOptions}
          onChange={onRoundChange}
          placeholder="Chọn vòng..."
        />
      </div>

      {/* Track */}
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>Track</span>
        <Dropdown
          value={trackId}
          options={trackOptions}
          onChange={onTrackChange}
          placeholder="Chọn track..."
          disabled={roundId === 'all'}
        />
      </div>

      {/* BGK */}
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>BGK</span>
        <Dropdown
          value={judgeId}
          options={judgeOptions}
          onChange={onJudgeChange}
          placeholder="Chọn BGK..."
        />
      </div>

      {/* Tìm đội — đẩy sang phải */}
      <div className={styles.searchWrap}>
        <FormInput
          iconLeft={MagnifyingGlass}
          iconSize={20}
          placeholder="Tìm đội thi…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  )
}

export default ScoringFilterBar
