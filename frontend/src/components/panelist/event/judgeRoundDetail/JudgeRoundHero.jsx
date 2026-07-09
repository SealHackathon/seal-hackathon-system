import { CalendarBlank, Clock, Tag, BookOpen } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import Button from '../../../shared/Button'
import TagList from '../../../coordinator/TagList'
import styles from './JudgeRoundHero.module.css'

// Nhãn trạng thái chấm theo vòng đời của vòng.
const LIFECYCLE_STATUS = {
  active: { variant: 'green', label: 'Đang mở chấm' },
  ended: { variant: 'gray', label: 'Đã đóng chấm' },
  upcoming: { variant: 'blue', label: 'Chưa mở chấm' },
}

function fmtDate(d) {
  if (!d) return '--'
  const x = d instanceof Date ? d : new Date(d)
  return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`
}

function fmtDateTime(d) {
  if (!d) return '--'
  const x = d instanceof Date ? d : new Date(d)
  const hh = String(x.getHours()).padStart(2, '0')
  const mm = String(x.getMinutes()).padStart(2, '0')
  return `${hh}:${mm} · ${fmtDate(x)}`
}

/**
 * JudgeRoundHero — banner thông tin vòng chấm (chiếm ~60% hàng trên).
 * Trên: trạng thái + nút rubric. Giữa: tên vòng + metadata thời gian.
 * Dưới cùng: hạng mục được phân công.
 *
 * @param {object}   round
 * @param {function} [onOpenRubric]
 */
function JudgeRoundHero({ round, onOpenRubric }) {
  const status = LIFECYCLE_STATUS[round.lifecycle] ?? LIFECYCLE_STATUS.upcoming
  const cats = round.allCategories ? ['Tất cả hạng mục'] : (round.categories ?? [])
  // Hàng tiêu đề: để badge trạng thái nằm kế bên tên vòng.
  const titleRowStyle = { display: 'flex', alignItems: 'center', gap: '0.6em', flexWrap: 'wrap' }

  return (
    <section className={styles.hero}>
      <div className={styles.top}>
        <div className={styles.headline}>
          <span className={styles.kicker}>Vòng {round.ordinal}</span>
          <div style={titleRowStyle}>
            <h1 className={styles.name}>{round.name}</h1>
            <Badge variant={status.variant} size="sm" label={status.label} />
          </div>
        </div>
        <Button
          label="Tiêu chí chấm điểm"
          labelSize={12}
          variant="outline"
          color="blue"
          icon={BookOpen}
          iconWeight="fill"
          onClick={() => onOpenRubric?.(round)}
        />
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>
          <CalendarBlank size={24} weight="fill" className={styles.metaIcon} />
          <span className={styles.metaText}>
            <span className={styles.metaLabel}>Thời gian vòng thi</span>
            <span className={styles.metaValue}>
              {fmtDate(round.timeStart)} – {fmtDate(round.timeEnd)}
            </span>
          </span>
        </span>
        <span className={styles.metaPill}>
          <Clock size={24} weight="fill" className={styles.metaIcon} />
          <span className={styles.metaText}>
            <span className={styles.metaLabel}>Hạn nộp bài</span>
            <span className={styles.metaValue}>{fmtDateTime(round.submissionDeadline)}</span>
          </span>
        </span>
        <span className={styles.metaPill}>
          <Tag size={24} weight="fill" className={styles.metaIcon} />
          <span className={styles.metaText}>
            <span className={styles.metaLabel}>Hạng mục được phân công</span>
            <span className={styles.catTags}>
              <TagList tags={cats} showLabel={false} />
            </span>
          </span>
        </span>
      </div>
    </section>
  )
}

export default JudgeRoundHero