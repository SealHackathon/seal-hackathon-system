import { List, CaretRight } from '@phosphor-icons/react'
import styles from './GuidelineCard.module.css'

function GuidelineCard({ guidelines }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <List weight="fill" size={24} />
        <span className={styles.cardTitle}>Hướng dẫn nộp bài từ BTC</span>
      </div>
      <div className={styles.guideList}>
        {guidelines.map((g, i) => (
          <div key={i} className={styles.guideItem}>
            <CaretRight weight="fill" />
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GuidelineCard
