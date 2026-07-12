import { CheckFat, SealCheck } from '@phosphor-icons/react'
import styles from './CriteriaCard.module.css'

function CriteriaCard({ criteria }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <SealCheck weight="fill" size={24} />
        <span className={styles.cardTitle}>Tiêu chí chấm điểm</span>
      </div>
      <div className={styles.critList}>
        {criteria.map((c, i) => (
          <div key={i} className={styles.critItem}>
            <CheckFat weight="fill" />
            <span>{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CriteriaCard
