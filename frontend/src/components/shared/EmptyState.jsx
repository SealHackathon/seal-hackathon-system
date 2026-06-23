import { SmileySad } from '@phosphor-icons/react'
import styles from './EmptyState.module.css'

/**
 * EmptyState — dashed placeholder khi không có dữ liệu
 *
 * @param {React.ReactNode} [icon]    — custom icon (mặc định SmileySad)
 * @param {string}          message   — text chính
 * @param {string}          [sub]     — text phụ
 */
function EmptyState({ icon: Icon = SmileySad, message = 'Chưa có dữ liệu', sub }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <Icon size={36} weight="fill" />
      </div>
      <p className={styles.message}>{message}</p>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  )
}

export default EmptyState
