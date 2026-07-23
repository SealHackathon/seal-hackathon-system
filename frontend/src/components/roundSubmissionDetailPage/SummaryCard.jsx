import {
  ClipboardText,
  PaperPlaneTilt,
  PencilSimple,
  Flag,
  ChatCircleText,
  CheckCircle,
  ClockCountdown,
} from '@phosphor-icons/react'
import styles from './SummaryCard.module.css'
import Badge from '../shared/Badge'

/**
 * @param {object}  [submission]           — Dữ liệu bài nộp. Không có thì card hiện trạng thái "chưa nộp"
 * @param {number}  [submission.score]     — Điểm tổng, thang 10
 * @param {string}  [submission.submittedAt]   — Thời gian nộp bài
 * @param {string}  [submission.lastEditedAt]  — Thời gian chỉnh sửa lần cuối
 * @param {boolean} [submission.late]      — Nộp trễ hạn hay không
 * @param {string}  [submission.comment]   — Nhận xét của giám khảo (nếu có)
 * @param {string}  [state]                — Trạng thái chấm bài, vd 'done_eval' khi đã chấm xong
 */
function SummaryCard({ submission, state }) {
  // ── Dữ liệu suy ra từ props ──────────────────────────
  const hasScore = submission?.score != null
  const scoreToneClass = getScoreToneClass(hasScore, state)
  const comment = submission?.comment

  const metaItems = [
    { icon: PaperPlaneTilt, label: 'Thời gian nộp', value: submission?.submittedAt || '—' },
    { icon: PencilSimple, label: 'Chỉnh sửa lần cuối', value: submission?.lastEditedAt || '—' },
    {
      icon: Flag,
      label: 'Trạng thái',
      value: submission ? <StatusBadge late={submission.late} /> : 'Chưa nộp bài',
    },
  ]

  return (
    <div className={styles.card}>
      {/* ── Tiêu đề ── */}
      <div className={styles.cardHead}>
        <ClipboardText weight="fill" size={24} />
        <span className={styles.cardTitle}>Tổng quan bài nộp</span>
      </div>

      {/* ── Điểm số & thông tin ── */}
      <div className={styles.sumTop}>
        <div className={`${styles.sumScore} ${scoreToneClass}`}>
          <div className={styles.sumScoreVal}>{hasScore ? submission.score : '—'}</div>
          <div className={styles.sumScoreLbl}>{hasScore ? 'Điểm tổng / 10' : 'Chưa có điểm'}</div>
        </div>
        <div className={styles.sumMeta}>
          {metaItems.map((item) => (
            <MetaItem key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* ── Nhận xét ── */}
      <div className={styles.sumComment}>
        <div className={styles.commentHead}>
          <ChatCircleText weight="fill" size={24}/>
          Nhận xét của Ban giám khảo
        </div>
        {comment && Array.isArray(comment) ? (
          <div className={styles.commentList}>
            {comment.map((line, idx) => (
              <div key={idx} className={styles.commentLine}>
                <span className={styles.commentBullet}>•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        ) : comment ? (
          <p className={styles.commentText}>{comment}</p>
        ) : (
          <p className={styles.commentEmpty}>Chưa có nhận xét nào.</p>
        )}
      </div>
    </div>
  )
}

// ── Chọn class màu cho ô điểm theo trạng thái ────────────
function getScoreToneClass(hasScore, state) {
  if (!hasScore) return styles.sumScoreGrey
  return state === 'done_eval' ? styles.sumScoreBlue : styles.sumScoreGreen
}

// ── Một dòng thông tin: icon + nhãn + giá trị ────────────
function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className={styles.metaItem}>
      <Icon weight="fill" size={24} />
      <div>
        <span className={styles.metaLbl}>{label}</span>
        {typeof value === 'string' ? <span className={styles.metaVal}>{value}</span> : value}
      </div>
    </div>
  )
}

// ── Badge trạng thái nộp bài (đúng hạn / trễ hạn) ────────
function StatusBadge({ late }) {
  return (
    <Badge
      variant={late ? 'orange' : 'green'}
      icon={late ? <ClockCountdown weight="fill" /> : <CheckCircle weight="fill" />}
      label={late ? 'Đã nộp (Trễ hạn)' : 'Đã nộp (Đúng hạn)'}
    />
  )
}

export default SummaryCard