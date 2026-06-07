import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlass, CaretDown, CaretUp } from '@phosphor-icons/react'
import styles from './Dropdown.module.css'

function Dropdown({
  label,
  labelPosition = 'top',   // 'top' | 'side'
  icon,
  placeholder = 'Chọn...',
  value,
  onChange,
  options = [],            // Array<{ section?, items: [{value, label}] }> hoặc [{value, label}]
  disabled,
  required,
  status,
  message,
  searchable,
  clearable,
  maxHeight = '240px',
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const Icon = icon

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Normalize options — hỗ trợ cả flat array và array có section
  const normalizedOptions = options.length > 0 && options[0].items
    ? options
    : [{ items: options }]

  function getSelectedLabel() {
    for (const group of normalizedOptions) {
      const found = group.items.find(i => i.value === value)
      if (found) return found.label
    }
    return null
  }

  // Filter theo search
  function filterItems(items) {
    if (!searchable || !search) return items
    return items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
  }

  function handleSelect(val) {
    onChange(val)
    setOpen(false)
    setSearch('')
  }

  const selectedLabel = getSelectedLabel()

  const trigger = (
    <div
      className={`${styles.trigger} ${status ? styles[status] : ''} ${disabled ? styles.disabled : ''} ${open ? styles.open : ''}`}
      onClick={() => !disabled && setOpen(o => !o)}
    >
      {Icon && <span className={styles.iconLeft}><Icon size={24} /></span>}

      <span className={`${styles.triggerText} ${!selectedLabel ? styles.placeholder : ''}`}>
        {selectedLabel ?? placeholder}
      </span>

      {clearable && selectedLabel && (
        <button
          className={styles.clearBtn}
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(null) }}
        >×</button>
      )}

      <span className={styles.caret}>
        {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
      </span>
    </div>
  )

  const dropdown = open && (
    <div className={styles.menu} style={{ maxHeight }}>
      {searchable && (
        <div className={styles.searchBox}>
          <MagnifyingGlass size={20} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className={`${styles.optionContainer} ${'scrollbar'}`}>
        {normalizedOptions.map((group, gi) => {
          const filtered = filterItems(group.items)
          if (filtered.length === 0) return null
          return (
            <div key={gi} className={styles.group}>
              {group.section && (
                <p className={styles.sectionLabel}>{group.section}</p>
              )}
              {filtered.map(item => (
                <div
                  key={item.value}
                  className={`${styles.option} ${item.value === value ? styles.selected : ''}`}
                  onClick={() => handleSelect(item.value)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )
        })}
      </div>

    </div>
  )

  return (
    <div className={`${styles.wrapper} ${labelPosition === 'side' ? styles.sideLayout : ''}`} ref={ref}>

      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}> *</span>}
        </label>
      )}

      <div className={styles.control}>
        {trigger}
        {dropdown}

        {message && (
          <p className={`${styles.message} ${status ? styles[status] : ''}`}>
            {message}
          </p>
        )}
      </div>

    </div>
  )
}

export default Dropdown