import Tooltip from '../shared/Tooltip'
import styles from './StatChip.module.css'

/**
 * StatChip — hiển thị số liệu nổi bật + label mô tả
 * Tham khảo pattern từ MetaChip.
 *
 * @param {string}          value        — Số liệu (vd "42 / 100", "4")
 * @param {string}          label        — Mô tả (vd "Đội thi", "Hạng mục")
 * @param {React.ReactNode} [icon]       — Icon phía trên value (optional)
 * @param {string}          [tooltip]    — Nếu có thì hiện tooltip + dấu * cam
 */
function StatChip({ value, label, icon, tooltip }) {
  const chip = (
    <div className={styles.chip}>
      {icon && (
        <span className={styles.icon}>{icon}</span>
      )}

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {tooltip && <span className={styles.asterisk}>*</span>}
      </div>

      <span className={styles.label}>{label}</span>
    </div>
  )

  if (!tooltip) return chip

  return (
    <Tooltip content={tooltip} position="top" bgColor="blue" textColor="white">
      {chip}
    </Tooltip>
  )
}

export default StatChip