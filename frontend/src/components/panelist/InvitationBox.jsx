import styles from './InvitationBox.module.css'

/**
 * InvitationBox — khung chứa các lời mời theo vai trò.
 * Tông màu đổi theo `variant` (green = giám khảo, orange = mentor).
 *
 * @param {'green'|'orange'} [variant]
 * @param {React.ElementType} icon        — icon Phosphor cho tiêu đề
 * @param {string}   [iconWeight]         — độ đậm của icon (fill, bold, ...)
 * @param {string}   title
 * @param {number}   [count]              — số lời mời (hiện trên huy hiệu)
 * @param {React.ReactNode} children      — danh sách InvitationCard
 * @param {string}   [emptyText]          — chữ hiển thị khi không có lời mời
 */
function InvitationBox({
  variant = 'green',
  icon: Icon,
  iconWeight = 'fill',
  title,
  count = 0,
  children,
  emptyText = 'Chưa có lời mời nào.',
}) {
  const toneClass = variant === 'orange' ? styles.orange : styles.green

  return (
    <section className={`${styles.box} ${toneClass}`}>
      {/* Tiêu đề box: icon + tên + huy hiệu đếm */}
      <header className={styles.head}>
        <span className={styles.headIcon}>
          {Icon && <Icon size={22} weight={iconWeight} />}
        </span>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.count}>{count}</span>
      </header>

      {/* Nội dung: các card hoặc trạng thái rỗng */}
      <div className={styles.body}>
        {count > 0 ? children : <p className={styles.empty}>{emptyText}</p>}
      </div>
    </section>
  )
}

export default InvitationBox