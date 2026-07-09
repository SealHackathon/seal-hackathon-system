import styles from './Badge.module.css'

/**
 * Badge — pill label chung
 *
 * @param {'green'|'blue'|'orange'|'red'|'gray'
 *        |'greenSolid'|'blueSolid'|'orangeSolid'|'redSolid'|'graySolid'
 *        |'dashedGreen'|'dashedBlue'|'dashedOrange'|'dashedRed'|'dashedGray'|'blueWhiteBg'} [variant='gray']
 * @param {string}          label        — text hiển thị (bắt buộc)
 * @param {'sm'|'md'|'lg'}  [size='md']
 * @param {boolean}         [dot=true]   — hiển thị dot bên trái
 * @param {React.ReactNode} [icon]       — icon thay thế dot (ưu tiên hơn dot)
 */
function Badge({ variant = 'gray', label, size = 'md', dot = true, icon }) {
  return (
    <span className={[
      styles.badge,
      styles[variant] ?? styles.gray,
      styles[size]    ?? '',
    ].join(' ')}>
      {icon
        ? <span className={styles.icon}>{icon}</span>
        : dot && <span className={styles.dot} />
      }
      {label}
    </span>
  )
}

export default Badge