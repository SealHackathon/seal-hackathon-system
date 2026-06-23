import styles from './ToggleSwitch.module.css'

/**
 * @param {boolean}  checked       — Trạng thái bật/tắt
 * @param {Function} onChange      — Callback khi toggle (nhận boolean mới)
 * @param {string}   [label]       — Label hiển thị bên cạnh toggle
 * @param {string}   [description] — Mô tả nhỏ bên dưới label
 * @param {boolean}  [disabled]
 */
function ToggleSwitch({ 
    checked = false, 
    onChange, label, 
    description, 
    disabled = false }) {
  function handleChange(e) {
    if (!disabled) onChange?.(!checked)
  }

  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
      {/* Label + description */}
      {(label || description) && (
        <span className={styles.textGroup}>
          {label      && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      )}

      {/* Hidden checkbox — xử lý keyboard + accessibility */}
      <input
        className={styles.hiddenInput}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />

      {/* Visual track + thumb */}
      <span className={`${styles.track} ${checked ? styles.trackOn : styles.trackOff}`}>
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : styles.thumbOff}`} />
      </span>

      

    </label>
  )
}

export default ToggleSwitch