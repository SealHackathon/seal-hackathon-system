import { useMemo } from 'react'
import {
  UsersThree, CheckCircle, HourglassHigh, NotePencil, Flag, Warning,
} from '@phosphor-icons/react'
import Banner from '../../shared/Banner'
import styles from './ScoringOverviewCards.module.css'

/**
 * ScoringOverviewCards — Section ① Tổng quan toàn sự kiện
 * Không chịu tác động của filter — luôn hiển thị số liệu toàn giải
 *
 * Props:
 *   overview: { totalTeams, totalScored, totalPending, pendingScoreEdits, pendingViolations, discrepancyCount }
 *   discrepancyList: [{ teamId, teamName, trackName, stdDev }]
 *   onOpenScoreEditRequests: () => void — mở modal xử lý yêu cầu chỉnh sửa
 *   onOpenViolationRequests: () => void — mở modal xử lý vi phạm
 */
function ScoringOverviewCards({ overview, onOpenScoreEditRequests, onOpenViolationRequests }) {
  // Tính % tiến độ chấm điểm
  const progress = useMemo(() => {
    if (!overview || overview.totalTeams === 0) return 0
    return Math.round((overview.totalScored / overview.totalTeams) * 100)
  }, [overview])

  if (!overview) return null

  return (
    <div className={styles.wrapper}>
      {/* Hàng 1 — Stat cards: số liệu tiến độ */}
      <div className={styles.statRow}>
        {/* Tổng đội */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap + ' ' + styles.iconBlue}>
            <UsersThree size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue}>{overview.totalTeams}</span>
              <span className={styles.statLabel}>Tổng đội thi</span>
            </div>
          </div>
        </div>

        {/* Đã chấm xong */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap + ' ' + styles.iconGreen}>
            <CheckCircle size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue + ' ' + styles.valueGreen}>{overview.totalScored}</span>
              <span className={styles.statLabel}>Đã chấm xong</span>
            </div>
            {/* Thanh tiến độ mini */}
            <div className={styles.progressWrap}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressLabel}>{progress}%</span>
            </div>
          </div>
        </div>

        {/* Chờ chấm */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap + ' ' + styles.iconOrange}>
            <HourglassHigh size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue + ' ' + styles.valueOrange}>{overview.totalPending}</span>
              <span className={styles.statLabel}>Chờ chấm</span>
            </div>
          </div>
        </div>

        {/* Divider dọc */}
        <div className={styles.verticalDivider} />

        {/* YC chỉnh điểm chờ — clickable */}
        <button
          type="button"
          className={styles.statCard + ' ' + styles.actionCard + ' ' + styles.actionGreen}
          onClick={onOpenScoreEditRequests}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconGreen}>
            <NotePencil size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.actionCount}>{overview.pendingScoreEdits}</span>
              <span className={styles.actionLabel}>Yêu cầu chỉnh điểm</span>
            </div>
          </div>
        </button>

        {/* Cờ vi phạm chờ — clickable */}
        <button
          type="button"
          className={styles.statCard + ' ' + styles.actionCard + ' ' + styles.actionOrange}
          onClick={onOpenViolationRequests}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconOrange}>
            <Flag size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.actionCount}>{overview.pendingViolations}</span>
              <span className={styles.actionLabel}>Cờ vi phạm</span>
            </div>
          </div>
        </button>
      </div>

    </div>
  )
}

export default ScoringOverviewCards
