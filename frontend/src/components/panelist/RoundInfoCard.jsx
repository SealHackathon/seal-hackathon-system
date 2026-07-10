import { FileText } from '@phosphor-icons/react'
import Badge from '../shared/Badge'
import styles from './RoundInfoCard.module.css'

/**
 * RoundInfoCard — hiển thị thông tin vòng thi (Section C).
 * Tách riêng để tái sử dụng ở các màn khác (chi tiết sự kiện, chấm thi…).
 *
 * @param {object}   round
 * @param {number}   round.index
 * @param {number}   round.total
 * @param {string}   round.name
 * @param {string}   [round.phaseLabel]      — vd "Sắp diễn ra" / "Đang diễn ra"
 * @param {string}   [round.countdownLabel]
 * @param {string}   round.submitDeadline
 * @param {string}   round.submitted         — vd "0 / 100"
 * @param {string}   [round.rubricName]
 * @param {Array}    [round.schedule]        — [{ time, title, desc }]
 * @param {function} [onViewRubric]
 */
function formatVNTime(dateStr) {
  if (!dateStr) return 'Chưa cập nhật'
  
  let parseStr = String(dateStr)
  // Nếu backend trả về ISO không có múi giờ, ép thành UTC bằng cách thêm 'Z'
  if (!parseStr.endsWith('Z') && !parseStr.includes('+')) {
    parseStr += 'Z'
  }

  const d = new Date(parseStr)
  if (isNaN(d.getTime())) return dateStr

  const options = { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  }
  
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', options)
    const parts = formatter.formatToParts(d)
    
    let day, month, year, hour, minute;
    for (const part of parts) {
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
    }
    
    if (day && month && year && hour && minute) {
      return `${hour}:${minute} - ${day}/${month}/${year}`
    }
  } catch(e) {
    console.error('Error formatting date', e)
  }

  return parseStr
}

function RoundInfoCard({ round, onViewRubric }) {
  if (!round?.name) return null

  const phaseLabel = round.phaseLabel ?? 'Sắp diễn ra'

  // Tách chuỗi "0 / 100" để vẽ thanh tiến độ nộp bài
  const [subDone, subTotal] = String(round.submitted ?? '')
    .split('/')
    .map((s) => parseInt(s.replace(/\D/g, ''), 10) || 0)
  const submitPercent = subTotal ? Math.round((subDone / subTotal) * 100) : 0

  return (
    <div className={styles.wrap}>
      {/* ===== Tiêu đề vòng ===== */}
      <div className={styles.head}>
        <div className={styles.topRow}>
          <span className={styles.kicker}>
            {phaseLabel} vòng {round.index} / {round.total}
          </span>
          {round.countdownLabel && (
            <Badge variant="orange" dot={false} size="sm" label={round.countdownLabel} />
          )}
        </div>
        <p className={styles.title}>{round.name}</p>
      </div>

      {/* ===== Bài nộp ===== */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Bài nộp</p>

        <div className={styles.facts}>
          <div className={styles.factRow}>
            <span className={styles.factLabel}>Hạn nộp bài</span>
            <span className={styles.factValue}>{formatVNTime(round.submitDeadline)}</span>
          </div>

          {round.rubricName && (
            <div className={styles.factRow}>
              <span className={styles.factLabel}>Tiêu chí chấm điểm</span>
              <button type="button" className={styles.rubricChip} onClick={onViewRubric}>
                <FileText className={styles.rubricIcon} size={14} weight="fill" />
                <span className={styles.rubricName}>{round.rubricName}</span>
              </button>
            </div>
          )}

          <div className={styles.factRow}>
            <span className={styles.factLabel}>Số đội đã nộp</span>
            <span className={styles.factValue}>{round.submitted}</span>
          </div>

          {/* Thanh tiến độ nộp bài */}
          <div className={styles.submitBar}>
            <div className={styles.submitFill} style={{ width: `${submitPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ===== Lịch trình ===== */}
      {round.schedule?.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Lịch trình</p>

          <div className={styles.scheduleList}>
            {round.schedule.map((row, i) => (
              <div key={i} className={styles.scheduleRow}>
                <span className={styles.scheduleTime}>{row.time}</span>
                <div className={styles.scheduleInfo}>
                  <span className={styles.scheduleName}>{row.title}</span>
                  {row.desc && <span className={styles.scheduleDesc}>{row.desc}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoundInfoCard
