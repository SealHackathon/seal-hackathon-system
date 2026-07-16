import { CaretRight, UsersThree } from '@phosphor-icons/react'
import Badge from '../shared/Badge'
import { getStatusMeta } from './teamStatus'
import styles from './TeamApprovalTable.module.css'

function TeamApprovalTable({ teams = [], onSelect }) {
    if (teams.length === 0) {
        return (
            <div className={styles.empty}>
                Không tìm thấy đội thi nào phù hợp.
            </div>
        )
    }

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Tên đội</th>
                        <th>Trưởng nhóm</th>
                        <th>Thành viên</th>
                        <th>Track</th>
                        <th>Trạng thái</th>
                        <th aria-label="Hành động" />
                    </tr>
                </thead>
                <tbody>
                    {teams.map(t => {
                        const st = getStatusMeta(t.teamStatus)
                        return (
                            <tr
                                key={t.teamId}
                                className={styles.row}
                                onClick={() => onSelect?.(t)}
                            >
                                <td>
                                    <div className={styles.nameCell}>
                                        <div className={styles.avatar}>
                                            <UsersThree size={20} weight="duotone" />
                                        </div>
                                        <span>{t.teamName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.leaderCell}>
                                        <span className={styles.leaderName}>{t.leaderName}</span>
                                        <span className={styles.muted}>{t.leaderEmail}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.memberCount}>{t.memberCount} thành viên</span>
                                </td>
                                <td>
                                    <span className={styles.linkText}>{t.trackName || 'Chưa phân nhánh'}</span>
                                </td>
                                <td>
                                    <Badge variant={st.variant} label={st.label} size="md" />
                                </td>
                                <td className={styles.actionCell}>
                                    <button
                                        type="button"
                                        className={styles.openBtn}
                                        onClick={e => { e.stopPropagation(); onSelect?.(t) }}
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

export default TeamApprovalTable
