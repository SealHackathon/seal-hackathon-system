import styles from './EmptyState.module.css'

/**
 * EmptyState — trạng thái rỗng dùng chung (khi không có dữ liệu).
 * Khung viền nhẹ, căn giữa: vòng tròn icon + tiêu đề + mô tả.
 *
 * @param {React.ElementType} icon        — icon Phosphor
 * @param {string}   [iconWeight]         — độ đậm icon (mặc định fill)
 * @param {string}   title
 * @param {string}   [description]
 * @param {React.ReactNode} [action]       — nút hành động tùy chọn (ví dụ Button)
 */
function EmptyState({ icon: Icon, iconWeight = 'fill', title, description, action }) {
  return (
    <div className={styles.empty}>
      {Icon && (
        <span className={styles.iconCircle}>
          <Icon size={26} weight={iconWeight} />
        </span>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export default EmptyState