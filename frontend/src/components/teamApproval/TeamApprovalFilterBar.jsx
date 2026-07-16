import { MagnifyingGlass, CaretDown } from '@phosphor-icons/react'
import styles from './TeamApprovalFilterBar.module.css'

function TeamApprovalFilterBar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    statuses = [],
}) {
    return (
        <div className={styles.bar}>
            {/* ── Ô tìm kiếm ── */}
            <div className={styles.search}>
                <MagnifyingGlass size={20} weight="bold" />
                <input
                    type="text"
                    value={search}
                    placeholder="Tìm kiếm tên đội hoặc leader ..."
                    onChange={e => onSearchChange?.(e.target.value)}
                />
            </div>

            {/* ── Lọc trạng thái ── */}
            <div className={styles.selectWrap}>
                <select
                    className={styles.select}
                    value={status}
                    onChange={e => onStatusChange?.(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    {statuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <CaretDown size={18} weight="bold" className={styles.selectCaret} />
            </div>
        </div>
    )
}

export default TeamApprovalFilterBar
