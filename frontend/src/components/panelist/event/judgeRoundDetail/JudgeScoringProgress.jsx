import { CheckCircle, FloppyDiskBack, Circle } from '@phosphor-icons/react'
import styles from './JudgeScoringProgress.module.css'

/**
 * JudgeScoringProgress — box tiến độ chấm (chiếm ~40% hàng trên).
 * Trên cùng: số đội đã chấm xong / tổng. Giữa: thanh progress 2 màu.
 * Dưới: các chỉ số theo trạng thái chấm.
 *
 * @param {number} [done=0]      — số đội đã chấm xong
 * @param {number} [draft=0]     — số đội đang lưu nháp
 * @param {number} [unscored=0]  — số đội chưa chấm
 */
function JudgeScoringProgress({ done = 0, draft = 0, unscored = 0 }) {
  const total = done + draft + unscored
  const donePct = total > 0 ? (done / total) * 100 : 0
  const draftPct = total > 0 ? (draft / total) * 100 : 0
  const doneStyle = { width: `${donePct}%` }
  const draftStyle = { width: `${draftPct}%` }

  return (
    <section className={styles.box}>
      {/* Số đội đã chấm xong nằm trên cùng */}
      <div className={styles.count}>
        <span className={styles.countValue}>
          {done}/{total}
        </span>
        <span className={styles.countLabel}>đội đã chấm xong</span>
      </div>

      {/* Thanh tiến độ: xanh (đã xong) + cam (lưu nháp) + nền xám (chưa chấm) */}
      <div className={styles.track}>
        <div className={styles.segDone} style={doneStyle} />
        <div className={styles.segDraft} style={draftStyle} />
      </div>

      {/* Chỉ số theo trạng thái nằm dưới thanh progress */}
      <div className={styles.stats}>
        <span className={`${styles.stat} ${styles.statDone}`}>
          <CheckCircle size={24} weight="fill" /> {done} đã chấm xong
        </span>
        <span className={`${styles.stat} ${styles.statDraft}`}>
          <FloppyDiskBack size={24} weight="fill" /> {draft} lưu nháp
        </span>
        <span className={`${styles.stat} ${styles.statNone}`}>
          <Circle size={24} weight="bold" /> {unscored} chưa chấm
        </span>
      </div>
    </section>
  )
}

export default JudgeScoringProgress
