import { useState } from 'react'
import { BookOpen, FloppyDisk, PaperPlaneTilt, PencilSimpleLine } from '@phosphor-icons/react'
import Button from '../../shared/Button'
import CriterionRow from './CriterionRow'
import styles from './ScoringPanel.module.css'

function fmtDateTime(iso) {
  if (!iso) return '--'
  const x = new Date(iso)
  const hh = String(x.getHours()).padStart(2, '0')
  const mm = String(x.getMinutes()).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  const mo = String(x.getMonth() + 1).padStart(2, '0')
  return hh + ':' + mm + ' · ' + dd + '/' + mo
}

/**
 * ScoringPanel — cột phải: bảng chấm điểm theo rubric.
 * Xử lý đầy đủ 3 trạng thái: unscored (chưa chấm) / draft (lưu nháp) / done (đã nộp).
 *
 * @param {object}   rubric
 * @param {Array}    criteria
 * @param {'unscored'|'draft'|'done'} status
 * @param {object}   existing   — { scores, notes, overall, audit, hasDiscrepancy }
 * @param {function} [onOpenRubric]
 * @param {function} [onSaveDraft]
 * @param {function} [onSubmit]
 * @param {function} [onRequestEdit]
 */
function ScoringPanel({
  rubric,
  criteria,
  status = 'unscored',
  existing = {},
  onOpenRubric,
  onSaveDraft,
  onSubmit,
  onRequestEdit,
}) {
  const readOnly = status === 'done'
  const prefilled = status === 'draft' || status === 'done'

  const [scores, setScores] = useState(prefilled ? existing.scores ?? {} : {})
  const [notes, setNotes] = useState(prefilled ? existing.notes ?? {} : {})
  const [overall, setOverall] = useState(prefilled ? existing.overall ?? '' : '')

  // Tổng = tổng(điểm_i × trọng_số_i / 10). Trọng số cộng lại = 10 → tổng tối đa 10.
  const total = criteria.reduce((sum, c) => {
    const v = scores[c.id]
    return v == null ? sum : sum + (Number(v) * c.points) / 10
  }, 0)
  const totalPct = Math.min(100, (total / 10) * 100)
  const totalBarStyle = { width: totalPct + '%' }

  const scoredCount = criteria.filter((c) => scores[c.id] != null).length
  const canSubmit = scoredCount >= 1

  const setScore = (id, v) => setScores((prev) => ({ ...prev, [id]: v }))
  const setNote = (id, v) => setNotes((prev) => ({ ...prev, [id]: v }))

  const audit = existing.audit ?? {}

  return (
    <div className={styles.panel}>
      {/* Tiêu đề + nút Tiêu chí chấm điểm */}
      <div className={styles.header}>
        <h2 className={styles.title}>Bảng chấm điểm theo rubric</h2>
        <Button
          label="Tiêu chí chấm điểm"
          labelSize={13}
          variant="outline"
          color="blue"
          icon={BookOpen}
          iconWeight="fill"
          onClick={() => onOpenRubric?.(rubric)}
        />
      </div>

      {/* Danh sách tiêu chí */}
      <div className={styles.criteria}>
        {criteria.map((c) => (
          <CriterionRow
            key={c.id}
            criterion={c}
            value={scores[c.id]}
            note={notes[c.id]}
            onScore={(v) => setScore(c.id, v)}
            onNote={(v) => setNote(c.id, v)}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Bình luận tổng thể */}
      <div className={styles.overallBox}>
        <span className={styles.overallLabel}>Nhận xét tổng thể</span>
        {readOnly ? (
          <p className={styles.overallRead}>{overall || '— Không có nhận xét tổng thể —'}</p>
        ) : (
          <textarea
            className={styles.overallArea}
            rows={3}
            placeholder="Nhận xét chung về bài nộp (điểm mạnh, điểm cần cải thiện...)"
            value={overall}
            onChange={(e) => setOverall(e.target.value)}
            data-lenis-prevent="true"
          />
        )}
      </div>

      {/* Audit log */}
      {status === 'draft' && audit.savedAt && (
        <p className={styles.audit}>
          <FloppyDisk size={13} weight="fill" /> Đã lưu nháp lúc {fmtDateTime(audit.savedAt)}
        </p>
      )}
      {status === 'done' && audit.submittedAt && (
        <p className={styles.auditDone}>
          <PaperPlaneTilt size={13} weight="fill" /> Đã nộp điểm lúc {fmtDateTime(audit.submittedAt)}
        </p>
      )}

      {/* Điểm tổng và Thao tác */}
      <div className={styles.totalAndActions}>
        <div className={styles.totalBox}>
          <div className={styles.totalTop}>
            <span className={styles.totalLabel}>Điểm tổng</span>
            <span className={styles.totalValue}>
              {total.toFixed(2)}
              <span className={styles.totalMax}>/10</span>
            </span>
          </div>
          <div className={styles.totalTrack}>
            <div className={styles.totalFill} style={totalBarStyle} />
          </div>
        </div>

        <div className={styles.actions}>
          {readOnly ? (
            existing.hasDiscrepancy ? (
              <div className={styles.editZone}>
                <Button
                  label="Yêu cầu chỉnh sửa điểm"
                  icon={PencilSimpleLine}
                  iconWeight="fill"
                  variant="outline"
                  color="orange"
                  onClick={() => onRequestEdit?.()}
                />
                <span className={styles.editHint}>Có chênh lệch điểm giữa các giám khảo nên được phép yêu cầu chỉnh sửa.</span>
              </div>
            ) : (
              <span className={styles.lockedNote}>Điểm đã nộp, không thể chỉnh sửa.</span>
            )
          ) : (
            <div className={styles.actionGroup}>
              <div className={styles.actionBtns}>
                <Button
                  label="Lưu nháp"
                  variant="outline"
                  color="blue"
                  icon={FloppyDisk}
                  iconWeight="fill"
                  onClick={() => onSaveDraft?.({ scores, notes, overall, total })}
                />
                <Button
                  label="Nộp điểm"
                  variant="primary"
                  color="blue"
                  icon={PaperPlaneTilt}
                  iconWeight="fill"
                  disabled={!canSubmit}
                  onClick={() => onSubmit?.({ scores, notes, overall, total })}
                />
              </div>
              {!canSubmit && (
                <span className={styles.submitHint}>Chấm ít nhất 1 tiêu chí để có thể nộp điểm.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScoringPanel
