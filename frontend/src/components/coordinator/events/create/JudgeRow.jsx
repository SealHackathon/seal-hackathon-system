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
 *   onWithdrawInvite : () => void
 */
function JudgeRow({ judge, categories = [], onChange, onDelete, onSendInvite, onWithdrawInvite }) {
    const isPending = judge.inviteStatus === 'pending'
    const canSend = isPending
    const canWithdraw = judge.inviteStatus === 'sent' || judge.inviteStatus === 'accepted'
    const isDeclined = judge.inviteStatus === 'declined'
    const hasAllOption = categories.some(c => c.value === null)
    const selectedCategoryIds = hasAllOption
        ? (judge.categoryIds ?? [])
        : (judge.categoryIds ?? []).filter(value => value !== null)

    const handleCategoryChange = (newVals) => {
        const availableValues = categories.filter(c => c.value !== null && !c.disabled).map(c => c.value);
        const currentVals = judge.categoryIds ?? [];
        const allowAllOption = categories.some(c => c.value === null)

        if (!allowAllOption) {
            onChange({ ...judge, categoryIds: newVals.filter(value => value !== null) })
            return
        }
        
        const hasAllNow = newVals.includes(null);
        const hadAllBefore = currentVals.includes(null);

        let result = newVals;

        if (hasAllNow && !hadAllBefore) {
            // User just clicked "Tất cả" -> chọn tất cả (available)
            result = [null, ...availableValues];
        } else if (!hasAllNow && hadAllBefore) {
            // User just unclicked "Tất cả" -> xoá toàn bộ
            result = [];
        } else if (hasAllNow && hadAllBefore) {
            // User unclicked an individual item while "Tất cả" was checked -> remove "Tất cả"
            const hasAllAvailable = availableValues.every(val => newVals.includes(val));
            if (!hasAllAvailable) {
                result = newVals.filter(v => v !== null);
            }
        } else if (!hasAllNow && !hadAllBefore) {
            // User manually checked all items -> add "Tất cả"
            const hasAllAvailable = availableValues.length > 0 && availableValues.every(val => newVals.includes(val));
            if (hasAllAvailable) {
                result = [null, ...newVals];
            }
        }

        onChange({ ...judge, categoryIds: result });
    };

    return (
        <div className={`${styles.row} ${isDeclined ? styles.rowDeclined : ''}`}>

            {/* Avatar + info */}
            <div className={styles.person}>
                <div className={styles.avatar}>
                    {judge.avatar
                        ? <img src={judge.avatar} alt={judge.name} className={styles.avatarImg} />
                        : <span className={styles.avatarFallback}>{judge.name?.charAt(0)}</span>
                    }
                </div>
                <div className={styles.info}>
                    <div className={styles.nameRow}>
                        <span className={styles.name}>{judge.name}</span>
                        <InviteStatusBadge status={judge.inviteStatus} sentAt={judge.inviteSentAt} />
                    </div>
                    <span className={styles.sub}>
                        {[judge.title, judge.org].filter(Boolean).join(' \u00b7 ')}
                    </span>
                </div>
            </div>

            <div className={styles.cell}>
                <MultiSelectDropdown
                    placeholder="Chọn hạng mục"
                    value={selectedCategoryIds}
                    onChange={handleCategoryChange}
                    options={categories}
                    searchable
                />
            </div>

            {/* Trạng thái + hành động + Xóa */}
            <div className={styles.actionsGroup}>
                {canSend && (
                    <Button
                        label="Gửi lời mời"
                        variant="outline"
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
