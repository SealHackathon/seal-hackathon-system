import React from 'react'
import ModalShell from '../../shared/ModalShell'
import JudgeScoreChart from './JudgeScoreChart'
import { ChartBar } from '@phosphor-icons/react'
import styles from './ScoreEditModal.module.css' // Reusing styles

function ScoreDistributionModal({ isOpen, onClose, teamId, entries, judges, criteria }) {
  if (!isOpen || !teamId) return null

  const entry = entries.find(e => e.teamId === teamId)
  if (!entry) return null

  // Extract judges that have submitted for this team
  const teamJudges = (entry.perJudge || []).filter(j => j.submitted)
  // Map it to match what JudgeScoreChart expects
  const chartJudges = teamJudges.map(j => {
    const judgeInfo = judges.find(jx => jx.id === j.judgeId)
    return {
      id: j.judgeId,
      name: judgeInfo?.name || 'BGK',
      isSender: false,
      scores: j.scores || {}
    }
  })

  return (
    <ModalShell
      onClose={onClose}
      title={`Phân tán điểm - ${entry.teamName}`}
      icon={<ChartBar size={24} weight="fill" />}
      subtitle="Biểu đồ phân tán điểm số giữa các ban giám khảo."
      size="md"
    >
      <div className={styles.content} style={{ padding: '1rem 0' }}>
        <div className={styles.chartBlock}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Phân tán điểm theo tiêu chí</span>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDotNormal} /> BGK
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendBand} /> ±1σ
              </span>
            </div>
          </div>
          <JudgeScoreChart
            criteria={criteria}
            judges={chartJudges}
            affectedId={null}
          />
        </div>
      </div>
    </ModalShell>
  )
}

export default ScoreDistributionModal
