import { X, PaperPlaneTilt } from '@phosphor-icons/react'
import Button from '../../../shared/Button'
import MultiSelectDropdown from '../../../shared/MultiSelectDropdown'
import { InviteStatusBadge } from './MentorRow'
import styles from './JudgeRow.module.css'

/**
 * JudgeRow
 * Props:
 *   judge      : { id, name, title, org, avatar, categoryIds[], roundIds[], inviteStatus, inviteSentAt }
 *   categories : [{ value, label }]
 *   rounds     : [{ value, label }]
 *   onChange   : (updated) => void
 *   onDelete   : () => void
 *   onWithdrawInvite : () => void
 */
function JudgeRow({ judge, categories = [], rounds = [], onChange, onDelete, onSendInvite, onWithdrawInvite }) {
    const isPending = judge.inviteStatus === 'pending'
    const canSend = isPending
    const canWithdraw = judge.inviteStatus === 'sent' || judge.inviteStatus === 'accepted'

    return (
        <div className={styles.row}>

            {/* Avatar + info */}
            <div className={styles.person}>
                <div className={styles.avatar}>
                    {judge.avatar
                        ? <img src={judge.avatar} alt={judge.name} className={styles.avatarImg} />
                        : <span className={styles.avatarFallback}>{judge.name?.charAt(0)}</span>
                    }
                </div>
                <div className={styles.info}>
                    <span className={styles.name}>{judge.name}</span>
                    <span className={styles.sub}>
                        {[judge.title, judge.org].filter(Boolean).join(' \u00b7 ')}
                    </span>
                </div>
            </div>

            <div className={styles.cell}>
                <MultiSelectDropdown
                    placeholder="Chọn hạng mục"
                    value={judge.categoryIds ?? []}
                    onChange={vals => onChange({ ...judge, categoryIds: vals })}
                    options={categories}
                    searchable
                />
            </div>

            <div className={styles.cell}>
                <MultiSelectDropdown
                    placeholder="Chọn vòng thi"
                    value={judge.roundIds ?? []}
                    onChange={vals => onChange({ ...judge, roundIds: vals })}
                    options={rounds}
                />
            </div>

            {/* Trạng thái + hành động + Xóa */}
            <div className={styles.actionsGroup}>
                <InviteStatusBadge status={judge.inviteStatus} sentAt={judge.inviteSentAt} />
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
                        label="Hủy lời mời"
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

export default JudgeRow
