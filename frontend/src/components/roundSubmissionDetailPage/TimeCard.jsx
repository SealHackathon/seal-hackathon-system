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

function daysBetween(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / msPerDay))
}

/**
 * @param {object} round  — openAt, closeAt, submissionOpenAt (định dạng "DD/MM/YYYY, HH:mm")
 * @param {string} state  — 'upcoming' | 'active' | 'late' | 'done...'
 * @param {string} now    — Thời điểm hiện tại, cùng định dạng với round.openAt/closeAt
 */
function TimeCard({ round, state }) {
  const closeDate = new Date(round.rawDeadline || round.rawEnd)
  const daysLeft = daysBetween(new Date(), closeDate)

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
          />
        ),
        rightContent: <Countdown target={closeDate} size="small" />,
      }

    case 'upcoming':
      return {
        deadlineBox: null,
        rightContent: <Countdown target={new Date(round.rawStart)} size="small" />,
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

function DeadlineBox({ openIcon: OpenIcon, closeIcon: CloseIcon, round }) {
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
        </div>
      </div>
    </div>
  )
}

export default TimeCard