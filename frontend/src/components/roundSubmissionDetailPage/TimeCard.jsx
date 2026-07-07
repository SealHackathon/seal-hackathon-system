import {
  DoorOpen,
  Door,
  ArrowRight,
  Clock,
  CalendarBlank,
  FolderLock,
  FolderOpen,
} from '@phosphor-icons/react'
import styles from './TimeCard.module.css'
import Countdown from '../shared/countdown/Countdown'
import Badge from '../shared/Badge'

// Dữ liệu ngày giờ có định dạng "DD/MM/YYYY, HH:mm" (giờ Việt Nam) — `Date` không tự đọc được
// định dạng này, nên phải đổi sang ISO "YYYY-MM-DDTHH:mm:00" trước khi parse.
const VN_DATETIME_PATTERN = /(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/

function parseVNDateTime(dateTimeStr) {
  return new Date(dateTimeStr.replace(VN_DATETIME_PATTERN, '$3-$2-$1T$4:$5:00'))
}

function daysBetween(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / msPerDay))
}

/**
 * @param {object} round  — openAt, closeAt, submissionOpenAt (định dạng "DD/MM/YYYY, HH:mm")
 * @param {string} state  — 'upcoming' | 'active' | 'late' | 'done...'
 * @param {string} now    — Thời điểm hiện tại, cùng định dạng với round.openAt/closeAt
 */
function TimeCard({ round, state, now }) {
  const closeDate = parseVNDateTime(round.closeAt)
  const daysLeft = daysBetween(parseVNDateTime(now), closeDate)

  const { deadlineBox, rightContent } = getStateContent(state, round, closeDate, daysLeft)

  return (
    <div className={styles.timecard}>
      <div className={styles.colContainer}>
        {/* Row 1: Bắt đầu / Kết thúc */}
        <div className={styles.doorRow}>
          <div className={styles.seg}>
            <DoorOpen weight="fill" size={24} />
            <div>
              <span className={styles.lbl}>Bắt đầu</span>
              <span className={styles.val}>{round.openAt}</span>
            </div>
          </div>
          <span className={styles.arrow}><ArrowRight weight="bold" /></span>
          <div className={styles.seg}>
            <Door weight="fill" size={24} />
            <div>
              <span className={styles.lbl}>Kết thúc</span>
              <span className={styles.val}>{round.closeAt}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Hạn nộp bài — tuỳ trạng thái vòng thi */}
        {deadlineBox && <div className={styles.deadlineBox}>{deadlineBox}</div>}

        {/* Row 3: Countdown hoặc badge trạng thái */}
        {rightContent && <div className={styles.countdownBox}>{rightContent}</div>}
      </div>
    </div>
  )
}

// ── Nội dung Row 2 & Row 3 theo từng trạng thái vòng thi ──
function getStateContent(state, round, closeDate, daysLeft) {
  const normalizedState = state.startsWith('done') ? 'done' : state

  switch (normalizedState) {
    case 'late':
      return {
        deadlineBox: <DeadlineBox openIcon={FolderOpen} closeIcon={FolderLock} round={round} />,
        rightContent: <Badge variant="orangeSolid" icon={<Clock weight="fill" />} label="Đang mở nộp bù" />,
      }

    case 'active':
      return {
        deadlineBox: (
          <DeadlineBox
            openIcon={FolderOpen}
            closeIcon={CalendarBlank}
            round={round}
            daysLeftBadge={
              <Badge variant="dashedOrange" icon={<Clock weight="fill" />} label={`Còn ${daysLeft} ngày`} />
            }
          />
        ),
        rightContent: <Countdown target={closeDate} size="small" />,
      }

    case 'upcoming':
      return {
        deadlineBox: null,
        rightContent: <Countdown target={parseVNDateTime(round.openAt)} size="small" />,
      }

    case 'done':
      return {
        deadlineBox: <DeadlineBox openIcon={FolderOpen} closeIcon={FolderLock} round={round} />,
        rightContent: <Badge variant="dashedOrange" icon={<Door weight="fill" />} label="Đã đóng cổng" />,
      }

    default:
      return { deadlineBox: null, rightContent: null }
  }
}

// ── Khối "Mở nộp bài" + "Hạn chính thức" — dùng lại cho late/active/done ──
function DeadlineBox({ openIcon: OpenIcon, closeIcon: CloseIcon, round, daysLeftBadge }) {
  return (
    <div className={styles.deadlineGroup}>
      <div className={styles.deadlineItem}>
        <div className={styles.deadline}><OpenIcon weight="fill" size={24}/>Mở nộp bài:</div>
        <div className={styles.deadlineVal}>{round.submissionOpenAt || '—'}</div>
      </div>
      <div className={styles.deadlineItem}>
        <div className={styles.deadline}><CloseIcon weight="fill" size={24}/>Hạn chính thức:</div>
        <div className={styles.deadlineVal}>
          {round.closeAt}
          {daysLeftBadge}
        </div>
      </div>
    </div>
  )
}

export default TimeCard