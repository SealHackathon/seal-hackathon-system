import styles from './SortBar.module.css'

/**
 * SortBar
 *
 * @param {Array}    options     — [{key, label, icon?}]
 * @param {string}   activeKey
 * @param {function} onChange    — (key) => void
 * @param {string}   [label='Sắp xếp theo']
 */
function SortBar({ options = [], activeKey, onChange, label = 'Sắp xếp theo' }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      {options.map(opt => (
        <button
          key={opt.key}
          className={`${styles.btn} ${activeKey === opt.key ? styles.btnActive : ''}`}
          onClick={() => onChange?.(opt.key)}
        >
          {opt.icon && opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default SortBar