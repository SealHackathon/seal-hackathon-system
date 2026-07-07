import { ChartPieSlice } from '@phosphor-icons/react'
import styles from './ProgressCard.module.css'

function ProgressCard({ progress, activeRound }) {
  if (!progress) return null;

  const { currentRoundIndex, totalRounds, percentage, currentRoundName, rank, score } = progress;
  
  const circleStyle = {
    background: `conic-gradient(var(--color-primary-blue) ${percentage}%, var(--color-bg-grey) 0)`
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <ChartPieSlice size={24} weight="fill" color="var(--color-border-blue)" />
        <h3 className={styles.title}>Tổng quan tiến độ</h3>
      </div>
      
      <div className={styles.progressRow}>
        <div className={styles.circleContainer} style={circleStyle}>
          <div className={styles.circleInner}>
            <span className={styles.circleValue}>{currentRoundIndex}/{totalRounds}</span>
            <span className={styles.circleLabel}>VÒNG</span>
          </div>
        </div>
        
        <div className={styles.progressInfo}>
          <div className={styles.infoLabel}>Vòng hiện tại:</div>
          <div className={styles.infoName}>{currentRoundName}</div>
          {activeRound?.submissionDeadline && (
            <div className={styles.deadlineWrapper}>
              <span className={styles.deadlineLabel}>Hạn:</span>
              <span className={styles.deadlineValue}>{activeRound.submissionDeadline}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.statsPanel}>
        <div className={styles.scoreSection}>
          <div className={styles.scoreValue}>{score}</div>
          <div className={styles.scoreLabel}>Tổng điểm / {progress.maxScore}</div>
        </div>
        <div className={styles.statsDivider} />
        <div className={styles.rankSection}>
          <div className={styles.rankBadge}>
            <span>Hạng {rank} / {progress.totalTeams}</span>
          </div>
          <div className={styles.rankLabel}>Bảng {progress.groupName}</div>
        </div>
      </div>
    </div>
  )
}

export default ProgressCard;
