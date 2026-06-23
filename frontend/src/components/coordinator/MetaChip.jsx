import Tooltip from '../shared/Tooltip'
import styles from './MetaChip.module.css'

/**
 * MetaChip — icon + label bold + value
 * Chỉ hiện tooltip khi truyền prop `tooltip` vào.
 *
 * @param {React.ReactNode} icon
 * @param {string}          label
 * @param {string}          value
 * @param {string}          [tooltip]  — nếu không truyền thì không có tooltip
 */
function MetaChip({ icon, label, value, tooltip }) {
  const chip = (
    <div className={styles.chip}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  )

  if (!tooltip) return chip

  return (
    <Tooltip content={tooltip} position="top" bgColor="blue" textColor="white">
      {chip}
    </Tooltip>
  )
}

export default MetaChip