import { useState, useRef } from 'react'
import styles from './TagPicker.module.css'

// ─────────────────────────────────────────────────────────────
//  TagPicker  — controlled component
//
//  Props:
//    label      string           Tên trường (ví dụ "Công nghệ sử dụng")
//    required   bool             Có dấu * hay không
//    maxTotal   number           Tổng số thẻ tối đa chọn được (toàn bộ sections)
//    sections   SectionConfig[]  Cấu hình từng section (từ file data)
//    value      { [sectionId]: string[] }   Trạng thái được điều khiển từ ngoài
//    onChange   (newValue) => void
// ─────────────────────────────────────────────────────────────
function TagPicker({ label, required, maxTotal, sections = [], value = {}, onChange }) {
    // Custom tags được thêm thủ công, tách khỏi value để không lẫn với selected
    const [customOptions, setCustomOptions] = useState({})

    const totalSelected = sections.reduce(
        (sum, s) => sum + (value[s.id]?.length ?? 0),
        0
    )

    function toggleTag(sectionId, tag) {
        const current = value[sectionId] ?? []
        const isSelected = current.includes(tag)

        // Nếu chưa chọn mà đã đạt max thì không cho chọn thêm
        if (!isSelected && maxTotal && totalSelected >= maxTotal) return

        const next = isSelected
            ? current.filter(t => t !== tag)
            : [...current, tag]

        onChange({ ...value, [sectionId]: next })
    }

    function addCustomTag(sectionId, tag) {
        const trimmed = tag.trim()
        if (!trimmed) return

        // Thêm vào danh sách custom options nếu chưa có
        const prevCustom = customOptions[sectionId] ?? []
        const allOptions = [...(sections.find(s => s.id === sectionId)?.options ?? []), ...prevCustom]
        if (!allOptions.includes(trimmed)) {
            setCustomOptions(prev => ({
                ...prev,
                [sectionId]: [...prevCustom, trimmed],
            }))
        }

        // Tự động chọn tag vừa thêm
        const current = value[sectionId] ?? []
        if (!current.includes(trimmed) && (!maxTotal || totalSelected < maxTotal)) {
            onChange({ ...value, [sectionId]: [...current, trimmed] })
        }
    }

    return (
        <div className={styles.wrapper}>
            {/* Header: label + total counter */}
            <div className={styles.header}>
                <span className={styles.label}>
                    {label}
                    {required && <span className={styles.asterisk}>*</span>}
                </span>
                {maxTotal != null && (
                    <span className={styles.totalBadge}>
                        {totalSelected}/{maxTotal} thẻ
                    </span>
                )}
            </div>

            {/* Danh sách sections */}
            <div className={styles.sections}>
                {sections.map(section => {
                    const sectionCustom = customOptions[section.id] ?? []
                    const allOptions    = [...section.options, ...sectionCustom]
                    const selected      = value[section.id] ?? []
                    const reachedMax    = maxTotal != null && totalSelected >= maxTotal

                    return (
                        <TagSection
                            key={section.id}
                            section={section}
                            options={allOptions}
                            selected={selected}
                            reachedMax={reachedMax}
                            onToggle={tag => toggleTag(section.id, tag)}
                            onAddCustom={tag => addCustomTag(section.id, tag)}
                        />
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  TagSection  — internal
// ─────────────────────────────────────────────────────────────
function TagSection({ section, options, selected, reachedMax, onToggle, onAddCustom }) {
    const [inputOpen,  setInputOpen]  = useState(false)
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef(null)

    function openInput() {
        setInputOpen(true)
        // focus sau khi render
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    function confirmInput() {
        onAddCustom(inputValue)
        setInputValue('')
        setInputOpen(false)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter')  confirmInput()
        if (e.key === 'Escape') { setInputValue(''); setInputOpen(false) }
    }

    return (
        <div className={styles.section}>
            {/* Section header */}
            <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>
                    {section.label}
                    {section.required && <span className={styles.asterisk}>*</span>}
                    {section.min > 0 && (
                        <span className={styles.minNote}> (tối thiểu {section.min} thẻ)</span>
                    )}
                </span>
                <span className={styles.sectionCount}>
                    Đã chọn {selected.length} thẻ
                </span>
            </div>

            <div className={styles.divider} />

            {/* Body: description + pills */}
            <div className={styles.sectionBody}>
                {section.description && (
                    <p className={styles.description}>{section.description}</p>
                )}

                <div className={styles.pillsGrid}>
                    {options.map(tag => (
                        <TagPill
                            key={tag}
                            tag={tag}
                            active={selected.includes(tag)}
                            disabled={!selected.includes(tag) && reachedMax}
                            onToggle={() => onToggle(tag)}
                        />
                    ))}

                    {/* Inline custom input hoặc nút "+" */}
                    {inputOpen ? (
                        <span className={styles.customInputWrap}>
                            <input
                                ref={inputRef}
                                className={styles.customInput}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={confirmInput}
                                placeholder="Nhập thẻ..."
                                maxLength={30}
                            />
                        </span>
                    ) : (
                        <button className={styles.addPill} onClick={openInput} type="button">
                            + Nhập thủ công
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  TagPill  — internal
// ─────────────────────────────────────────────────────────────
function TagPill({ tag, active, disabled, onToggle }) {
    const cls = [
        styles.pill,
        active   ? styles.pillActive   : '',
        disabled ? styles.pillDisabled : '',
    ].filter(Boolean).join(' ')

    return (
        <button
            className={cls}
            onClick={onToggle}
            disabled={disabled}
            type="button"
        >
            {tag}
        </button>
    )
}

export default TagPicker
