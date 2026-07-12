import { Pen, CaretRight, Briefcase, UsersThree } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import Button from '../../../shared/Button'
import SubmissionRing from '../../../shared/SubmissionRing'
import styles from './JudgeSubmissionTable.module.css'

// Nhãn trạng thái chấm: xanh = xong, cam = đang nháp, xám = chưa chấm.
const STATUS = {
  unscored: { variant: 'gray', label: 'Chưa chấm' },
  draft: { variant: 'orange', label: 'Đã lưu nháp' },
  done: { variant: 'green', label: 'Đã chấm xong' },
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  const x = new Date(iso)
  const hh = String(x.getHours()).padStart(2, '0')
  const mm = String(x.getMinutes()).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  const mo = String(x.getMonth() + 1).padStart(2, '0')
  return `${hh}:${mm} · ${dd}/${mo}`
}

/**
 * JudgeSubmissionRow — một dòng bài nộp trong JudgeSubmissionTable.
 * Dùng chung style của bảng (JudgeSubmissionTable.module.css).
 *
 * @param {object}   submission
 * @param {function} [onScore]  — (submission) => void
 */
function JudgeSubmissionRow({ submission, onScore }) {
  const status = STATUS[submission.status] ?? STATUS.unscored
  const scored = submission.status !== 'unscored'

  const submissionItems = [
    { key: 'github', label: 'GitHub repo', done: !!submission.submission?.github },
    { key: 'video', label: 'Video demo', done: !!submission.submission?.video },
    { key: 'slide', label: 'Slide', done: !!submission.submission?.slide },
  ]

  let action
  if (submission.status === 'done') {
    action = (
      <div className={styles.actionCol}>
        <Button className={styles.actionBtn} labelSize={18} label="Xem lại điểm" variant="outline" color="blue" icon={CaretRight} iconPosition="right" onClick={() => onScore?.(submission.id)} />
        {submission.scoredAt && <span className={styles.actionTime}>Đã nộp: {fmtDateTime(submission.scoredAt)}</span>}
      </div>
    )
  } else if (submission.status === 'draft') {
    action = (
      <div className={styles.actionCol}>
        <Button className={styles.actionBtn} labelSize={18} label="Tiếp tục chấm" variant="outline" color="blue" icon={Pen} iconWeight="fill" onClick={() => onScore?.(submission.id)} />
        {submission.scoredAt && <span className={styles.actionTime}>Lưu lúc: {fmtDateTime(submission.scoredAt)}</span>}
      </div>
    )
  } else {
    action = (
      <div className={styles.actionCol}>
        <Button className={styles.actionBtn} labelSize={18} label="Chấm điểm" variant="primary" color="blue" icon={Pen} iconWeight="fill" onClick={() => onScore?.(submission.id)} />
      </div>
    )
  }

  return (
    <tr className={submission.status === 'draft' ? styles.rowDraft : ''}>
      {/* Đội thi */}
      <td className={styles.tdLeft}>
        <div className={styles.teamCell}>
          <span className={styles.teamName}>{submission.teamName}</span>
          <span className={styles.teamLeader}>Trưởng nhóm: {submission.leader}</span>
          <div className={styles.teamTags}>
            {submission.position && (
              <Badge variant="blue" size="sm" dot={false} label={submission.position} icon={<Briefcase size={14} weight="fill" color='var(--color-border-blue)' />} />
            )}
            {submission.memberCount != null && (
              <span className={styles.memberCount}>
                <UsersThree size={15} weight="fill" className={styles.cellIcon} />
                {submission.memberCount}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Nộp bài lúc */}
      <td>
        <span className={styles.subTime}>{fmtDateTime(submission.submittedAt)}</span>
      </td>

      {/* Bài nộp (github / video / slide) */}
      <td>
        <div className={styles.centerCell}>
          <SubmissionRing items={submissionItems} />
        </div>
      </td>

      {/* Điểm đã chấm */}
      <td>
        {scored && submission.score != null ? (
          <span className={styles.score}>
            {submission.score}
            <span className={styles.scoreMax}>/10</span>
          </span>
        ) : (
          <span className={styles.muted}>—</span>
        )}
      </td>

      {/* Trạng thái chấm */}
      <td>
        <Badge variant={status.variant} size="sm" dot={submission.status !== 'unscored'} label={status.label} />
      </td>

      {/* Action */}
      <td className={styles.tdAction}>{action}</td>
    </tr>
  )
}

export default JudgeSubmissionRow
