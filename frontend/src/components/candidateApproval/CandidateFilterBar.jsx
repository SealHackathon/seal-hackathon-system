import { MagnifyingGlass, CaretDown } from '@phosphor-icons/react'
import styles from './CandidateFilterBar.module.css'

/**
 * CandidateFilterBar — thanh tìm kiếm + lọc phía trên bảng thí sinh.
 *
 * @param {string}   search            — từ khóa tìm kiếm hiện tại
 * @param {Function} onSearchChange    — callback(value)
 * @param {string}   category          — hạng mục đang chọn ('' = tất cả)
 * @param {Function} onCategoryChange  — callback(value)
 * @param {string}   status            — trạng thái đang chọn ('' = tất cả)
 * @param {Function} onStatusChange    — callback(value)
 * @param {{value:string,label:string}[]} [categories]
 * @param {{value:string,label:string}[]} [statuses]
 */
function CandidateFilterBar({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    status,
    onStatusChange,
    categories = [],
    statuses = [],
    searchPlaceholder = "Tìm kiếm tên hoặc email ..."
}) {
    return (
        <div className={styles.bar}>
            {/* ── Ô tìm kiếm ── */}
            <div className={styles.search}>
                <MagnifyingGlass size={20} weight="bold" />
                <input
                    type="text"
                    value={search}
                    placeholder={searchPlaceholder}
                    onChange={e => onSearchChange?.(e.target.value)}
                />
            </div>

            {/* ── Lọc hạng mục ── */}
            <div className={styles.selectWrap}>
                <select
                    className={styles.select}
                    value={category}
                    onChange={e => onCategoryChange?.(e.target.value)}
                >
                    <option value="">Tất cả hạng mục</option>
                    {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <CaretDown size={18} weight="bold" className={styles.selectCaret} />
            </div>

            {/* ── Lọc trạng thái ── */}
            <div className={styles.selectWrap}>
                <select
                    className={styles.select}
                    value={status}
                    onChange={e => onStatusChange?.(e.target.value)}
                >
                    <option value="">Trạng thái</option>
                    {statuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <CaretDown size={18} weight="bold" className={styles.selectCaret} />
            </div>
        </div>
    )
}

export default CandidateFilterBar
