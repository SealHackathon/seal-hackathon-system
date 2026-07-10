import styles from './FilterTabs.module.css'

const DOT_COLOR_CLASS = {
  'green': styles.dotGreen,
  'blue': styles.dotBlue,
  'orange': styles.dotOrange,
}

function FilterTabs({ filters = [], countByKey = {}, activeKey, onChange }) {
  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.row}>
        {filters.map(f => {
          const isActive = activeKey === f.key
          const dotColorClass = f.dot ? (DOT_COLOR_CLASS[f.dot] ?? '') : ''

          return (
            <button
              key={f.key}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onChange?.(f.key)}
            >
              {/* Dot tròn có màu */}
              {f.dot && !f.dotDashed && (
                <span className={`${styles.dot} ${dotColorClass}`} />
              )}

              {/* Dot dashed (draft) */}
              {f.dotDashed && (
                <span className={styles.dotDashed} />
              )}

              {/* Icon (cancelled, archived…) */}
              {f.icon && !f.dot && !f.dotDashed && (
                <span className={styles.icon}>{f.icon}</span>
              )}

              {f.label} ({countByKey[f.key] ?? 0})
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterTabs