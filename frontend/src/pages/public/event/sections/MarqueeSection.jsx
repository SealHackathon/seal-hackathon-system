import { StarFour } from '@phosphor-icons/react'
import styles from './MarqueeSection.module.css'

function MarqueeSection({ text = 'SEAL HACKATHON 2026 • EMERGING TECHNOLOGIES' }) {
  // Tạo mảng lặp lại để chữ chạy vô tận
  const repeats = Array(6).fill(0)

  return (
    <div className={styles.marqueeWrap}>
      <div className={styles.track}>
        {repeats.map((_, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.text}>{text}</span>
            <StarFour size={24} weight="fill" className={styles.icon} />
          </div>
        ))}
        {/* Clone thêm 1 bộ để loop mượt */}
        {repeats.map((_, i) => (
          <div key={`clone-${i}`} className={styles.item}>
            <span className={styles.text}>{text}</span>
            <StarFour size={24} weight="fill" className={styles.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarqueeSection
