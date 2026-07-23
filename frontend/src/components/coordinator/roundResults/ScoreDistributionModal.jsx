import React from 'react'
import ModalShell from '../../shared/ModalShell'
import JudgeScoreChart from './JudgeScoreChart'
import { ChartBar } from '@phosphor-icons/react'
import styles from './ScoreEditModal.module.css' // Reusing styles

function ScoreDistributionModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <ModalShell
      onClose={onClose}
      title={`Phân tán điểm - ${data.teamName}`}
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
            criteria={data.criteria}
            judges={data.judges}
            affectedId={null}
          />
        </div>
      </div>
    </ModalShell>
  )
}

export default ScoreDistributionModal
