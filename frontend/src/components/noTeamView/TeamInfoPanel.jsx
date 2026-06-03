import { CrownSimple, Plus } from '@phosphor-icons/react'
import styles from './TeamInfoPanel.module.css'
import memberStyles from '../leaderView/MemberRow.module.css'
import memberEmptyStyles from '../leaderView/EmptyMemberSlot.module.css'

function TeamInfoPanel({ team }) {
    const emptyCount = team.maxSlots - team.members.length

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.teamName}>{team.name}</h2>

            <span className={styles.memberBadge}>
                {team.members.length}/{team.maxSlots} thành viên
            </span>

            <div className={styles.avatarRow}>
                {Array.from({ length: team.members.length }, (_, i) => (
                    <div key={i} className={memberStyles.avatar}>
                        {i === 0 && (
                            <CrownSimple
                                size={32}
                                weight="fill"
                                className={memberStyles.crownIcon}
                            />
                        )}
                    </div>
                ))}

                {Array.from({ length: emptyCount }, (_, i) => (
                    <div key={`empty-${i}`} className={memberEmptyStyles.avatar}>
                        <Plus size={28} color="var(--color-border-blue)" />
                    </div>
                ))}
            </div>

            <div className={styles.bio}>
                <p className={styles.bioLabel}>Mô tả</p>
                <p className={styles.bioText}>{team.description}</p>
            </div>
        </div>
    )
}

export default TeamInfoPanel