import { Tag } from '@phosphor-icons/react'
import Tooltip from '../shared/Tooltip'
import styles from './TagList.module.css'

/**
 * TagList — danh sách tags với overflow +N + tooltip
 *
 * @param {string[]} tags
 * @param {number}   [maxVisible=4]
 * @param {boolean}  [showLabel=true]  — hiện icon + "Từ khóa" đầu dòng
 */
function TagList({ tags = [], maxVisible = 4, showLabel = true }) {
  const visible = tags.slice(0, maxVisible)
  const hidden  = tags.slice(maxVisible)

  return (
    <div className={styles.wrapper}>
      {showLabel && (
        <span className={styles.labelChip}>
          <Tag className={styles.icon} size={24} weight="fill" />
          Từ khóa
        </span>
      )}

      {visible.map((tag, i) => (
        <span key={i} className={styles.tag}>{tag}</span>
      ))}

      {hidden.length > 0 && (
        <Tooltip
          content={hidden.join(', ')}
          position="bottom"
          bgColor="blue"
          textColor="white"
        >
          <span className={styles.moreChip}>+{hidden.length}</span>
        </Tooltip>
      )}
    </div>
  )
}

export default TagList