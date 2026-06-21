import styles from './Badge.module.css'

const VARIANT_CONFIG = {
  live:      { label: 'Đang diễn ra', className: styles.live },
  upcoming:  { label: 'Sắp diễn ra', className: styles.upcoming },
  ended:     { label: 'Đã diễn ra',  className: styles.ended },
  draft:     { label: 'Lưu nháp',    className: styles.draft },
  archived:  { label: 'Lưu trữ',     className: styles.archived },
  cancelled: { label: 'Đã hủy',      className: styles.cancelled },
}

/**
 * Badge — status pill
 *
 * @param {'live'|'upcoming'|'ended'|'draft'|'archived'|'cancelled'} variant
 * @param {string} [label]   — override default label
 * @param {'sm'|'md'|'lg'}  [size]
 * @param {boolean} [dot]    — hiển thị dot bên trái
 */
function Badge({ variant = 'draft', label, size = 'md', dot = true }) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.draft
  const displayLabel = label ?? config.label

  return (
    <span
      className={[
        styles.badge,
        config.className,
        size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
      ].join(' ')}
    >
      {dot && <span className={styles.dot} />}
      {displayLabel}
    </span>
  )
}

export default Badge
