import { Info, BookBookmark, FacebookLogo } from '@phosphor-icons/react'
import styles from './UsefulInfoBox.module.css'

function UsefulInfoBox() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
          <Info size={24} weight="fill" color="var(--color-border-blue)" />
        <h3 className={styles.title}>Thông tin hữu ích</h3>
      </div>
      
      <div className={styles.divider} />

      <div className={styles.list}>
        <div className={styles.item}>
          <div className={styles.itemIcon}>
            <BookBookmark size={24} weight="fill" color="var(--color-primary-blue)" />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemTitle}>Thể lệ cuộc thi</div>
            <div className={styles.itemDesc}>Quy định về chấm điểm, giải thưởng.</div>
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.itemIcon}>
            <FacebookLogo size={24} weight="fill" color="var(--color-primary-blue)" />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemTitle}>Fanpage Đại học FPT</div>
            <div className={styles.itemDesc}>Theo dõi thông báo mới nhất từ BTC.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsefulInfoBox;
