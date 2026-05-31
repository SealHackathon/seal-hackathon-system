import { Plus } from '@phosphor-icons/react'
import styles from './EmptyMemberSlot.module.css'

function EmptyMemberSlot({ index }) {
  return (
    <div className={styles.row}>
      <span className={styles.index}>{index}</span>

      <div className={styles.avatar}>
        <Plus size={28} color="var(--color-border-blue)" />
      </div>

      <span className={styles.placeholder}>Có thể mời thêm thành viên</span>
    </div>
  )
}

export default EmptyMemberSlot