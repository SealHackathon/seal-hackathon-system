import { CaretRight } from '@phosphor-icons/react'
import Badge from '../shared/Badge'
import { getStatusMeta } from './candidateStatus'
import styles from './CandidateTable.module.css'

/**
 * CandidateTable — bảng danh sách thí sinh.
 * Bấm vào một hàng (hoặc nút mở) sẽ trigger onSelect(candidate).
 *
 * @param {Array}    candidates  — danh sách thí sinh
 * @param {Function} onSelect    — callback(candidate) khi chọn 1 hàng
 */
function CandidateTable({ candidates = [], onSelect }) {
    if (candidates.length === 0) {
        return (
            <div className={styles.empty}>
                Không tìm thấy thí sinh nào phù hợp.
            </div>
        )
    }

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Trường đại học</th>
                        <th>Đội thi</th>
                        <th>Trạng thái</th>
                        <th aria-label="Hành động" />
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(c => {
                        const st = getStatusMeta(c.status)
                        return (
                            <tr
                                key={c.id}
                                className={styles.row}
                                onClick={() => onSelect?.(c)}
                            >
                                <td>
                                    <div className={styles.nameCell}>
                                        {c.avatarUrl
                                            ? <img className={styles.avatar} src={c.avatarUrl} alt="" />
                                            : <span className={styles.avatar} />
                                        }
                                        <span>{c.name}</span>
                                    </div>
                                </td>
                                <td className={styles.muted}>{c.email}</td>
                                <td className={styles.linkText}>{c.university}</td>
                                <td className={styles.linkText}>{c.team || '—'}</td>
                                <td>
                                    <Badge variant={st.variant} label={st.label} size="md" />
                                </td>
                                <td className={styles.actionCell}>
                                    <button
                                        type="button"
                                        className={styles.openBtn}
                                        onClick={e => { e.stopPropagation(); onSelect?.(c) }}
                                        aria-label="Xem chi tiết"
                                    >
                                        <CaretRight size={18} weight="bold" />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default CandidateTable
