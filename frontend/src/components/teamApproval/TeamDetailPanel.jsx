import { useState, useEffect } from 'react'
import {
    X, UsersThree, Info, Link,
    GraduationCap, Briefcase, Code, Heart, Scales,
    CrownSimple, Plus
} from '@phosphor-icons/react'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import SegmentedControl from '../shared/SegmentedControl'
import Tooltip from '../shared/Tooltip'
import { getTeamStatusMeta } from './teamStatus'
import styles from './TeamDetailPanel.module.css'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'

// ─────────────────────────────────────────────
//  InfoField — 1 cặp nhãn + giá trị
// ─────────────────────────────────────────────
function InfoField({ label, value, icon: Icon, full }) {
    return (
        <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
            <span className={styles.fieldLabel}>{label}</span>
            <div className={styles.fieldValue}>
                {Icon && <Icon size={24} weight="fill" />}
                <span>{value || '—'}</span>
            </div>
        </div>
    )
}

function SectionBanner({ icon: Icon, title }) {
    return (
        <div className={styles.banner}>
            {Icon && <Icon size={20} weight="fill" />}
            <span>{title}</span>
        </div>
    )
}

function TeamDetailPanel({
    team,
    onClose,
    onApprove,
    onReject,
    onRevokeApproval
}) {
    const [tab, setTab] = useState('info') // 'info' | 'members'
    const [closing, setClosing] = useState(false)

    // Khóa cuộn trang khi mở panel
    useEffect(() => {
        if (team) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [team])

    if (!team) return null

    const st = getTeamStatusMeta(team.status)

    function handleClose() {
        setClosing(true)
        setTimeout(() => { onClose?.(); setClosing(false) }, 240)
    }

    function act(fn) {
        return () => { fn?.(team); handleClose() }
    }

    // Leader lên đầu
    const sortedMembers = [...(team.members || [])].sort((a, b) => (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0))

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <aside
                className={`${styles.panel} ${closing ? styles.panelClosing : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <header className={styles.header}>
                    <h2 className={styles.headerTitle}>Chi tiết đội thi</h2>
                    <button type="button" className={styles.closeBtn} onClick={handleClose}>
                        <X size={20} weight="bold" />
                    </button>
                </header>

                {/* ── Body ── */}
                <div className={`${styles.body} ${'scrollbar'}`}>
                    <div className={styles.tabsWrapper}>
                        <SegmentedControl
                            options={[
                                { value: 'info', label: 'Thông tin đội' },
                                { value: 'members', label: 'Thành viên' }
                            ]}
                            value={tab}
                            onChange={setTab}
                        />
                    </div>

                    {/* ── Tab: Thông tin đội ── */}
                    {tab === 'info' && (
                        <div className={styles.teamInfoWrapper}>
                            <h2 className={styles.teamNameLarge}>{team.teamName}</h2>

                            <div className={styles.teamBadges}>
                                <span className={styles.memberBadge}>
                                    {team.currentMembers}/{team.maxMembers} thành viên
                                </span>
                                <Badge variant={st.variant} label={st.label} size="sm" />
                                <Badge variant="orange" label={team.category} size="sm" dot={false} />
                            </div>

                            <div className={styles.avatarRow}>
                                {sortedMembers.map((member) => (
                                    <Tooltip
                                        bgColor='white'
                                        key={member.id}
                                        content={
                                            <div>
                                                {member.isLeader && (<span className={styles.leaderBadge}>(Đội trưởng)</span>)}
                                                <p className={styles.tooltipName}>{member.name}</p>
                                                <p className={styles.tooltipSchool}>{member.school}</p>
                                            </div>
                                        }
                                        position='bottom'
                                    >
                                        <div className={styles.avatarWrap}>
                                            <img src={member.avatar || avatarPlaceholder} alt="avatar" className={styles.avatarImg} />
                                            {member.isLeader && (
                                                <CrownSimple size={32} weight="fill" className={styles.crownIcon} />
                                            )}
                                        </div>
                                    </Tooltip>
                                ))}
                                {Array.from({ length: team.maxMembers - team.currentMembers }, (_, i) => (
                                    <div key={`empty-${i}`} className={styles.emptyAvatar}>
                                        <Plus size={24} color="var(--color-border-blue)" />
                                    </div>
                                ))}
                            </div>

                            <div className={styles.bioSection}>
                                <p className={styles.bioLabel}>Mô tả</p>
                                <p className={styles.bioText}>{team.description}</p>
                            </div>
                        </div>
                    )}

                    {/* ── Tab: Thành viên ── */}
                    {tab === 'members' && (
                        <div className={styles.section}>
                            {sortedMembers.map(member => (
                                <div key={member.id} className={styles.compactMemberCard}>
                                    <img src={member.avatar || avatarPlaceholder} alt="Avatar" className={styles.compactAvatar} />
                                    <div className={styles.compactInfo}>
                                        <div className={styles.compactHeader}>
                                            <h3 className={styles.compactName}>{member.name}</h3>
                                            {member.isLeader ? (
                                                <span className={styles.compactRoleLeader}>Đội trưởng</span>
                                            ) : (
                                                <span className={styles.compactRoleMember}>Thành viên</span>
                                            )}
                                        </div>
                                        <div className={styles.compactSchool}>
                                            <GraduationCap size={16} weight="duotone" />
                                            {member.school}
                                        </div>
                                        <div className={styles.compactTags}>
                                            {member.positions && member.positions.map((pos, idx) => (
                                                <span key={idx} className={`${styles.compactTag} ${styles.tagBlue}`}>{pos}</span>
                                            ))}
                                            {member.techTags && member.techTags.map((tag, idx) => (
                                                <span key={`tech-${idx}`} className={`${styles.compactTag} ${styles.tagBlue}`}>{tag}</span>
                                            ))}
                                        </div>
                                        {member.cvLink && (
                                            <a href={member.cvLink} target="_blank" rel="noreferrer" className={styles.compactLink}>
                                                CV / Portfolio <Link size={14} weight="bold" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer hành động ── */}
                <div className={styles.footer}>
                    <div className={styles.approvalBox}>
                        <p>Xử lý yêu cầu xét duyệt đội tham gia</p>
                        <div className={styles.approvalActions}>
                            {team.status === 'pending' && (
                                <>
                                    <Button
                                        className={styles.fullBtn}
                                        label="Từ chối"
                                        color="red"
                                        variant="outline"
                                        onClick={act(onReject)}
                                    />
                                    <Button
                                        className={styles.fullBtn}
                                        label="Phê duyệt"
                                        color="green"
                                        onClick={act(onApprove)}
                                    />
                                </>
                            )}
                            {team.status === 'approved' && (
                                <Button
                                    className={styles.fullBtn}
                                    label="Hủy phê duyệt"
                                    color="orange"
                                    variant="outline"
                                    onClick={act(onRevokeApproval)}
                                />
                            )}
                            {team.status === 'rejected' && (
                                <Button
                                    className={styles.fullBtn}
                                    label="Hủy từ chối"
                                    color="orange"
                                    variant="outline"
                                    onClick={act(onRevokeApproval)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default TeamDetailPanel
