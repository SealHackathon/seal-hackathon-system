import { ClockCounterClockwise, CheckCircle, NotePencil, Flag } from '@phosphor-icons/react'
import styles from './AuditOverviewCards.module.css'

function AuditOverviewCards({ overview, filterType, onFilterChange }) {
  if (!overview) return null

  // Helper to append active class if filter matches
  const getCardClass = (type, defaultClass, activeClass) => {
    let classes = `${styles.statCard} ${defaultClass || ''}`
    if (filterType === type) {
      classes += ` ${activeClass || ''}`
    }
    return classes
  }

  const handleFilterClick = (type) => {
    if (type !== 'all' && filterType === type) {
      onFilterChange('all')
    } else {
      onFilterChange(type)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.statRow}>
        {/* Tổng số thao tác */}
        <button 
          type="button"
          className={getCardClass('all', styles.hoverBlue, styles.activeSolid)}
          onClick={() => handleFilterClick('all')}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconBlue}>
            <ClockCounterClockwise size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue}>{overview.totalActions}</span>
              <span className={styles.statLabel}>Tổng thao tác</span>
            </div>
          </div>
        </button>

        {/* Đã chấm điểm */}
        <button 
          type="button"
          className={getCardClass('score_submitted', styles.hoverGreen, styles.activeGreen)}
          onClick={() => handleFilterClick('score_submitted')}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconGreen}>
            <CheckCircle size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue + ' ' + styles.valueGreen}>{overview.scoreSubmissions}</span>
              <span className={styles.statLabel}>Lượt chấm điểm</span>
            </div>
          </div>
        </button>

        {/* Sửa điểm */}
        <button 
          type="button"
          className={getCardClass('score_edited', styles.hoverBlue, styles.activeBlue)}
          onClick={() => handleFilterClick('score_edited')}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconBlue}>
            <NotePencil size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue}>{overview.scoreEdits}</span>
              <span className={styles.statLabel}>Lượt sửa điểm</span>
            </div>
          </div>
        </button>

        {/* Cờ vi phạm */}
        <button 
          type="button"
          className={getCardClass('flagged', styles.hoverOrange, styles.activeOrange)}
          onClick={() => handleFilterClick('flagged')}
        >
          <div className={styles.statIconWrap + ' ' + styles.iconOrange}>
            <Flag size={28} weight="fill" />
          </div>
          <div className={styles.statBody}>
            <div className={styles.statTextWrap}>
              <span className={styles.statValue + ' ' + styles.valueOrange}>{overview.violationsFlagged}</span>
              <span className={styles.statLabel}>Cờ vi phạm</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default AuditOverviewCards
