import { X, PaperPlaneTilt } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import Button from '../../../shared/Button'
import MultiSelectDropdown from '../../../shared/MultiSelectDropdown'
import styles from './MentorRow.module.css'

function fmtDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function InviteStatusBadge({ status, sentAt }) {
    if (status === 'accepted') return <Badge variant="green" label="Đã xác nhận" size="sm" />
    if (status === 'sent')     return <Badge variant="blue"  label={`Đã gửi ${fmtDate(sentAt)}`} size="sm" />
    if (status === 'declined') return <Badge variant="red"   label="Đã từ chối" size="sm" />
    return <Badge variant="gray" label="Chưa gửi lời mời" size="sm" dot={false} />
}

/**
 * MentorRow
 * Props:
 *   mentor     : { id, name, title, org, avatar, categoryId, inviteStatus, inviteSentAt }
 *   categories : [{ value, label }]
 *   onChange   : (updated) => void
 *   onDelete   : () => void
 *   onSendInvite     : () => void
 *   onWithdrawInvite : () => void
 */
function MentorRow({ mentor, categories = [], onChange, onDelete, onSendInvite, onWithdrawInvite }) {
    const isPending  = mentor.inviteStatus === 'pending'
    const canSend    = isPending
    const canWithdraw = mentor.inviteStatus === 'sent' || mentor.inviteStatus === 'accepted'

    return (
        <div className={styles.row}>

            {/* Avatar + info */}
            <div className={styles.person}>
                <div className={styles.avatar}>
                    {mentor.avatar
                        ? <img src={mentor.avatar} alt={mentor.name} className={styles.avatarImg} />
                        : <span className={styles.avatarFallback}>{mentor.name?.charAt(0)}</span>
                    }
                </div>
                <div className={styles.info}>
                    <span className={styles.name}>{mentor.name}</span>
                    <span className={styles.sub}>
                        {[mentor.title, mentor.org].filter(Boolean).join(' \u00b7 ')}
                    </span>
                </div>
            </div>

            <div className={styles.category}>
                <MultiSelectDropdown
                    placeholder="Chọn hạng mục"
                    value={mentor.categoryId ? [mentor.categoryId] : []}
                    onChange={vals => onChange({ ...mentor, categoryId: vals[0] ?? null })}
                    options={categories}
                    maxSelect={1}
                />
            </div>

            {/* Trạng thái + hành động + Xóa */}
            <div className={styles.actionsGroup}>
                <InviteStatusBadge status={mentor.inviteStatus} sentAt={mentor.inviteSentAt} />
                {canSend && (
                    <Button
                        label="Gửi lời mời"
                        variant="primary"
                        color="blue"
                        labelSize={14}
                        icon={PaperPlaneTilt}
                        iconPosition="right"
                        iconSize={14}
                        onClick={onSendInvite}
                    />
                )}
                {canWithdraw && (
                    <Button 
                        label='Hủy lời mời' 
                        labelSize={14}
                        variant="outline"
                        color="orange"
                        onClick={onWithdrawInvite}
                    />
                )}
                <button type="button" className={styles.deleteBtn} onClick={onDelete}>
                    <X size={14} weight="bold" />
                </button>
            </div>
        </div>
    )
}

export { InviteStatusBadge, fmtDate }
export default MentorRow
