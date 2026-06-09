import { CrownSimple, Plus } from '@phosphor-icons/react'
import styles from './TeamInfoPanel.module.css'
import memberStyles from '../leaderView/MemberRow.module.css'
import memberEmptyStyles from '../leaderView/EmptyMemberSlot.module.css'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'
import Tooltip from '../shared/Tooltip'

function TeamInfoPanel({ team }) {
    const emptyCount = team.maxSlots - team.members.length

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.teamName}>{team.name}</h2>

            <span className={styles.memberBadge}>
                {team.members.length}/{team.maxSlots} thành viên
            </span>

            <div className={styles.avatarRow}>
                {[...team.members]
                    .sort((a, b) => b.isLeader - a.isLeader)
                    .map((member, i) => (
                        <Tooltip
                            bgColor='white'
                            key={member.id}
                            content={
                                <div>
                                    {member.isLeader && (<span className={styles.leaderBadge}>(Đội trưởng)</span>)}
                                    <p className={styles.memberName}>{member.name}</p>
                                    <p className={styles.memberSchool}>{member.school}</p>
                                </div>

                            }
                            position='bottom'
                        >
                            <div className={memberStyles.avatar}>
                                <img src={avatarPlaceholder} alt="user avatar placeholder" className={memberStyles.avatarImg} />
                                {member.isLeader && (
                                    <CrownSimple
                                        size={32}
                                        weight="fill"
                                        className={memberStyles.crownIcon}
                                    />
                                )}
                            </div>
                        </Tooltip>
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