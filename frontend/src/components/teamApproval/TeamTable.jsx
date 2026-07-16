import { CaretRight } from '@phosphor-icons/react'
import Badge from '../shared/Badge'
import { getStatusMeta } from './teamStatus'
import styles from './TeamTable.module.css'

function TeamTable({ teams, onSelect }) {
    if (!teams || teams.length === 0) {
        return (
            <div className={styles.empty}>
                Chưa có đội nào.
            </div>
        )
    }

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Tên đội</th>
                        <th>Lĩnh vực thi</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {teams.map(t => {
                        const st = getTeamStatusMeta(t.status)
                        return (
                            <tr
                                key={t.id}
                                className={styles.row}
                                onClick={() => onSelect?.(t)}
                            >
                                <td>
                                    <div className={styles.nameCell}>
                                        <span className={styles.avatar}></span>
                                        <span>{t.teamName}</span>
                                    </div>
                                </td>
                                <td className={styles.linkText}>{t.category || '—'}</td>
                                <td className={styles.muted}>{t.currentMembers} / {t.maxMembers}</td>
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

export default TeamTable
