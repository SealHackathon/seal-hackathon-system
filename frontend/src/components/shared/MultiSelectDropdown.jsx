import { useState, useRef, useEffect } from 'react'
import { CaretDown, CaretUp, X, MagnifyingGlass, Check } from '@phosphor-icons/react'
import styles from './MultiSelectDropdown.module.css'

/**
 * @param {string}                      label          — Label phía trên
 * @param {string}                      [placeholder]  — Text khi chưa chọn gì
 * @param {React.ElementType}           [icon]         — Icon bên trái trigger
 * @param {string[]}                    value          — Mảng value đã chọn
 * @param {Function}                    onChange       — Callback(newValues: string[])
 * @param {Array<{section?, items[]}>}  options        — Danh sách chọn (có thể có section)
 * @param {number}                      [maxSelect]    — Giới hạn số lượng chọn (optional)
 * @param {boolean}                     [searchable]   — Cho phép tìm kiếm
 * @param {boolean}                     [allowCustom]  — Cho nhập thủ công
 * @param {string}                      [customLabel]  — Tên section nhập thủ công
 * @param {number}                      [customMaxLength] — Giới hạn ký tự custom input
 * @param {boolean}                     [required]
 * @param {boolean}                     [disabled]
 */
function MultiSelectDropdown({
  label,
  placeholder = 'Chọn từ danh sách',
  icon,
  value = [],
  onChange,
  options = [],
  maxSelect,
  searchable = false,
  allowCustom = false,
  customLabel = 'Không có trong danh sách?',
  customMaxLength = 30,
  required,
  disabled,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customText, setCustomText] = useState('')
  const [customChecked, setCustomChecked] = useState(false)
  const ref = useRef(null)
  const Icon = icon

  const hasCustomInValue = value.some(v => typeof v === 'string' && v.startsWith('custom:'))
  const effectiveCount = value.length + (customChecked && !hasCustomInValue ? 1 : 0)
  const isAtMax = maxSelect != null && effectiveCount >= maxSelect


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

  useEffect(() => {
    if (!open && customChecked && !customText) {
      setCustomChecked(false)
    }
  }, [open])


  // Normalize options → luôn có dạng [{section, items}]
  const normalizedOptions = options.length > 0 && options[0]?.items
    ? options
    : [{ items: options }]

  function toggleItem(val) {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      if (isAtMax) return   // đã đủ max, không cho chọn thêm
      onChange([...value, val])
    }
  }

  function removeChip(val, e) {
    e.stopPropagation()
    onChange(value.filter(v => v !== val))
  }


  // ! Liên quan tới custom text
  function toggleCustom() {
    if (!customChecked) {
      if (isAtMax) return
      setCustomChecked(true)
    } else {
      // Bỏ custom — xoá khỏi value list
      setCustomChecked(false)
      setCustomText('')
      onChange(value.filter(v => !(typeof v === 'string' && v.startsWith('custom:'))))
    }
  }

  // Khi user gõ custom text → update vào value list
  function handleCustomTextChange(e) {
    const text = e.target.value
    setCustomText(text)

    // Xoá custom cũ, thêm custom mới (nếu có text)
    const withoutCustom = value.filter(v => !(typeof v === 'string' && v.startsWith('custom:')))
    if (text.trim()) {
      onChange([...withoutCustom, `custom:${text}`])
    } else {
      onChange(withoutCustom)
    }
  }

  function removeChip(val, e) {
    e.stopPropagation()
    onChange(value.filter(v => v !== val))

    // * Nếu xoá chip custom (ấn vô cái dấu X) → tắt checkbox + xoá text
    if (typeof val === 'string' && val.startsWith('custom:')) {
      setCustomChecked(false)
      setCustomText('')
    }
  }




  function filterItems(items) {
    if (!searchable || !search) return items
    return items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
  }

  // Lấy label từ value để render chip
  function getLabelForValue(val) {
    if (typeof val === 'string' && val.startsWith('custom:')) return val.replace('custom:', '')
    for (const group of normalizedOptions) {
      const found = group.items.find(i => i.value === val)
      if (found) return found.label
    }
    return val
  }

  return (
    <div className={styles.wrapper} ref={ref}>

      {/* ── Label + counter ── */}
      {(label || maxSelect != null) && (
        <div className={styles.labelRow}>
          {label && (
            <span className={styles.label}>
              {label}
              {required && <span className={styles.asterisk}> *</span>}
            </span>
          )}
          {maxSelect != null && (
            <span className={`${styles.counter} ${isAtMax ? styles.counterMax : ''}`}>
              {value.length}/{maxSelect} lựa chọn
            </span>
          )}
        </div>
      )}

      {/* ── Trigger ── */}
      <div
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {Icon && <span className={styles.iconLeft}><Icon size={24} /></span>}

        {/* Chips hoặc placeholder */}
        <div className={styles.chipArea}>
          {value.length === 0 && !customChecked
            ? <span className={styles.placeholder}>{placeholder}</span>
            : <>
              {value.map(val => (
                <span key={val} className={styles.chip}>
                  {getLabelForValue(val)}
                  <button
                    className={styles.chipRemove}
                    type="button"
                    onClick={(e) => removeChip(val, e)}
                  >
                    <X size={12} weight="bold" />
                  </button>
                </span>
              ))}
            </>
          }
        </div>

        <span className={styles.caret}>
          {open ? <CaretUp size={24} /> : <CaretDown size={24} />}
        </span>
      </div>

      {/* ── Dropdown menu ── */}
      {open && (
        <div className={styles.menu}>

          {/* Search */}
          {searchable && (
            <div className={styles.searchBox}>
              <MagnifyingGlass size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {!searchable && (
            <p className={styles.menuHint}>Chọn từ danh sách</p>
          )}

          <div className={`${styles.optionList} ${'scrollbar'}`}>
            {normalizedOptions.map((group, gi) => {
              const filtered = filterItems(group.items)
              if (filtered.length === 0) return null
              return (
                <div key={gi} className={styles.group}>
                  {group.section && (
                    <p className={styles.sectionLabel}>{group.section}</p>
                  )}
                  {filtered.map(item => {
                    const isChecked = value.includes(item.value)
                    const isDisabled = !isChecked && isAtMax
                    return (
                      <div
                        key={item.value}
                        className={`${styles.option} ${isChecked ? styles.optionChecked : ''} ${isDisabled ? styles.optionDisabled : ''}`}
                        onClick={() => !isDisabled && toggleItem(item.value)}
                      >
                        <span className={`${styles.checkbox} ${isChecked ? styles.checkboxChecked : ''}`}>
                          {isChecked && <Check size={12} weight="bold" />}
                        </span>
                        <span className={styles.optionLabel}>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Custom input section */}
            {allowCustom && (
              <div className={`${styles.group} ${styles.groupCustom}`}>
                <p className={styles.sectionLabel}>{customLabel}</p>

                <div
                  className={`${styles.option} ${customChecked ? styles.optionChecked : ''} ${!customChecked && isAtMax ? styles.optionDisabled : ''}`}
                  onClick={() => (!customChecked && isAtMax) ? null : toggleCustom()}
                >
                  <span className={`${styles.checkbox} ${customChecked ? styles.checkboxChecked : ''}`}>
                    {customChecked && <Check size={12} weight="bold" />}
                  </span>
                  <span className={styles.optionLabel}>Nhập thủ công</span>
                </div>

                {customChecked && (
                  <>
                    <div className={styles.customInputWrapper}>
                      <input
                        className={styles.customInput}
                        placeholder="Game Developer, DevOps..."
                        value={customText}
                        maxLength={customMaxLength}
                        onChange={handleCustomTextChange}
                        autoFocus
                      />
                    </div>
                    <p className={styles.customCharCount}>
                      {customText.length}/{customMaxLength} kí tự
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default MultiSelectDropdown