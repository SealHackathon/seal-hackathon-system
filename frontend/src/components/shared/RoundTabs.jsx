import { Plus, X } from '@phosphor-icons/react'
import styles from './RoundTabs.module.css'

/**
 * RoundTabs — tab bar cố định cho các vòng thi
 *
 * Props:
 *   rounds        : Array<{ id, name }>   danh sách vòng
 *   activeId      : id của vòng đang chọn
 *   onSelect      : (id) => void
 *   onAdd         : () => void
 *   onDelete      : (id) => void          disable khi chỉ còn 1 vòng
 */
function RoundTabs({ rounds = [], activeId, onSelect, onAdd, onDelete }) {
    const canDelete = rounds.length > 1

    return (
        <div className={styles.tabBar}>
            <div className={styles.tabList}>
                {rounds.map((round, index) => {
                    const isActive = round.id === activeId
                    const isLast = index === rounds.length - 1

                    return (
                        <button
                            key={round.id}
                            type="button"
                            className={[
                                styles.tab,
                                isActive && styles.active,
                                isLast && styles.awardTab,
                            ].filter(Boolean).join(' ')}
                            onClick={() => onSelect?.(round.id)}
                        >
                            {/* Label nhỏ: Vòng N */}
                            <span className={styles.roundLabel}>Vòng {index + 1}</span>

                            {/* Tên vòng */}
                            <span className={styles.roundName}>
                                {round.name?.trim() || `Vòng ${index + 1}`}
                            </span>

                            {/* Nút xóa */}
                            {canDelete && (
                                <span
                                    className={styles.deleteBtn}
                                    role="button"
                                    tabIndex={0}
                                    onClick={e => {
                                        e.stopPropagation()
                                        onDelete?.(round.id)
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.stopPropagation()
                                            onDelete?.(round.id)
                                        }
                                    }}
                                >
                                    <X size={12} weight="bold" />
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Nút thêm vòng */}
            <button
                type="button"
                className={styles.addBtn}
                onClick={onAdd}
                title="Thêm vòng thi"
            >
                <Plus size={16} weight="bold" />
            </button>
        </div>
    )
}

export default RoundTabs
