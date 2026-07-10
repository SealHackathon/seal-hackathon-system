import { Path } from '@phosphor-icons/react'
import styles from './RoundStepper.module.css'

// -- Timeline các vòng thi dạng mũi tên bo góc, tiêu đề nằm ngang hàng --
// props: rounds[{id,name,lifecycle,timeStart,timeEnd}], currentRoundId, onChange

const pad = (n) => String(n).padStart(2, '0')

function fmtRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return pad(s.getDate()) + '/' + pad(s.getMonth() + 1) + ' – ' + pad(e.getDate()) + '/' + pad(e.getMonth() + 1)
}

function RoundStepper({ rounds, currentRoundId, onChange }) {
  const segments = [{ id: 'all', name: 'Tất cả', sub: 'Tổng thể', lifecycle: 'all' }, ...rounds]
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <Path size={24} weight="bold" className={styles.labelIcon} />
        <span className={styles.labelText}>Vòng thi</span>
      </div>

      <div className={styles.track}>
        {segments.map((seg) => {
          const selected = currentRoundId === seg.id
          const isAll = seg.id === 'all'
          const isRunning = seg.lifecycle === 'active'
          const cls = [
            styles.seg,
            selected ? styles.segSelected : isRunning ? styles.segRunning : styles.segIdle,
          ].join(' ')
          return (
            <button type="button" key={seg.id} className={cls} onClick={() => onChange(seg.id)}>
              <span className={styles.segName}>{seg.name}</span>
              <span className={styles.segDate}>{isAll ? seg.sub : fmtRange(seg.timeStart, seg.timeEnd)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RoundStepper