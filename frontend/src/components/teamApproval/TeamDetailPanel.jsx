import { useState, useEffect } from 'react'
import {
    X, UsersThree, Calendar, MapPin, Code,
    Heart, SuitcaseSimple, User, IdentificationBadge,
    Buildings, Link, EnvelopeSimple, Users,
    CaretDown, CaretUp, ArrowUUpLeft, Prohibit
} from '@phosphor-icons/react'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import { getStatusMeta } from './teamStatus'
import styles from './TeamDetailPanel.module.css'

function InfoField({ label, value, icon: Icon, full }) {
    return (
        <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
            <span className={styles.fieldLabel}>{label}</span>
            <div className={styles.fieldValue}>
                {Icon && <Icon size={24} weight="duotone" />}
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

function MemberCard({ member }) {
    return (
        <div className={styles.memberCard}>
            <div className={styles.memberHeader}>
                <div className={styles.memberAvatar}>
                    {member.role === 'LEADER' ? (
                        <IdentificationBadge size={20} weight="fill" color="var(--color-primary-orange)" />
                    ) : (
                        <User size={20} weight="fill" color="var(--color-primary-blue)" />
                    )}
                </div>
                <div className={styles.memberInfo}>
                    <p className={styles.memberName}>
                        {member.fullName}
                        {member.role === 'LEADER' && <span className={styles.leaderBadge}>Leader</span>}
                    </p>
                    <p className={styles.memberEmail}>{member.email}</p>
                </div>
                <div className={styles.memberStatus}>
                    <Badge 
                        variant={member.memberStatus === 'OFFICAL' ? 'green' : member.memberStatus === 'RESERVE' ? 'orange' : 'gray'} 
                        label={member.memberStatus === 'OFFICAL' ? 'Chính thức' : member.memberStatus === 'RESERVE' ? 'Dự bị' : 'Đã rời'} 
                        size="sm" 
                        dot={false}
                    />
                </div>
            </div>
            
            <div className={styles.memberDetails}>
                {member.school && (
                    <div className={styles.detailRow}>
                        <Buildings size={16} weight="duotone" />
                        <span>{member.school}</span>
                    </div>
                )}
                <div className={styles.detailRow}>
                    <Link size={16} weight="duotone" />
                    <span>Tham gia: {member.joinMethod}</span>
                </div>
            </div>
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
    const [approvalOpen, setApprovalOpen] = useState(true)
    const [closing, setClosing] = useState(false)

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

    const st = getStatusMeta(team.teamStatus)
    const isApproved = team.teamStatus === 'APPROVED'
    const isPending = team.teamStatus === 'PENDING_APPROVAL'

    function handleClose() {
        setClosing(true)
        setTimeout(() => { onClose?.(); setClosing(false) }, 240)
    }

    function act(fn) {
        return () => { fn?.(team); handleClose() }
    }

    return (
        <div className={styles.overlay} onClick={handleClose} data-lenis-prevent="true">
            <aside
                className={`${styles.panel} ${closing ? styles.panelClosing : ''}`}
                onClick={e => e.stopPropagation()}
                data-lenis-prevent="true"
            >
                {/* ── Header ── */}
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>Thông tin chi tiết đội thi</h3>
                    <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
                        <X size={22} weight="bold" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className={styles.body} data-lenis-prevent="true">

                    {/* Team Summary */}
                    <div className={styles.profile}>
                        <div className={styles.profileAvatar}>
                            <UsersThree size={32} weight="duotone" />
                        </div>
                        <div>
                            <h4 className={styles.profileName}>{team.teamName}</h4>
                            <div className={styles.profileContact}>
                                <span>Leader: {team.leaderName}</span>
                                <span>{team.trackName || 'Chưa phân nhánh'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.metaGrid}>
                        <InfoField label="Ngày tạo" value={team.createdAt} icon={Calendar} />
                        <div className={styles.field}>
                            <span className={styles.fieldLabel}>Trạng thái</span>
                            <div>
                                <Badge variant={st.variant} label={st.label} size="md" />
                            </div>
                        </div>
                        <InfoField label="Số thành viên" value={team.memberCount} icon={Users} />
                    </div>

                    {/* Mô tả đội */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Code size={24} weight="duotone" className={styles.sectionIcon} />
                            <p className={styles.sectionTitle}>Mô tả ý tưởng / Đội thi</p>
                        </div>
                        {team.description ? (
                            <p className={styles.bioText}>{team.description}</p>
                        ) : (
                            <p className={styles.emptyText}>Đội chưa cập nhật mô tả.</p>
                        )}
                    </div>

                    <div className={styles.divider} />

                    {/* Danh sách thành viên */}
                    <div className={styles.section}>
                        <SectionBanner icon={UsersThree} title="Danh sách thành viên" />
                        <div className={styles.membersList}>
                            {team.members && team.members.length > 0 ? (
                                team.members.map(member => (
                                    <MemberCard key={member.userId} member={member} />
                                ))
                            ) : (
                                <p className={styles.emptyText}>Chưa có thông tin thành viên.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer hành động ── */}
                <div className={styles.footer}>
                    {/* Hộp xử lý yêu cầu xét duyệt (chỉ hiện khi có yêu cầu hoặc đã duyệt) */}
                    {(isPending || isApproved) && (
                        <div className={styles.approvalBox}>
                            <button
                                type="button"
                                className={styles.approvalHead}
                                onClick={() => setApprovalOpen(o => !o)}
                            >
                                <span>Xử lý yêu cầu chốt đội</span>
                                {approvalOpen
                                    ? <CaretUp size={18} weight="bold" />
                                    : <CaretDown size={18} weight="bold" />
                                }
                            </button>
                            {approvalOpen && (
                                <div className={styles.approvalBody}>
                                    {isPending ? (
                                        <>
                                            <Button
                                                className={styles.fullBtn}
                                                label="Từ chối"
                                                labelSize={16}
                                                color="grey"
                                                variant="outline"
                                                onClick={act(onReject)}
                                            />
                                            <Button
                                                className={styles.fullBtn}
                                                label="Chấp nhận"
                                                labelSize={16}
                                                color="green"
                                                onClick={act(onApprove)}
                                            />
                                        </>
                                    ) : (
                                        <Button
                                            className={styles.fullBtn}
                                            label="Hủy chấp nhận"
                                            labelSize={16}
                                            color="orange"
                                            variant="outline"
                                            icon={ArrowUUpLeft}
                                            onClick={act(onRevokeApproval)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    )
}

export default TeamDetailPanel
