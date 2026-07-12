import { ArrowSquareOut, Check, X } from '@phosphor-icons/react'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import Tooltip from '../shared/Tooltip'
import styles from './InvitationCard.module.css'

/**
 *
 * @param {object}   invitation
 * @param {'judge'|'mentor'} invitation.roleType
 * @param {string}   invitation.eventName
 * @param {string}   invitation.scope       — hạng mục / nội dung được phân công
 * @param {string}   invitation.eventLink   — link trang cuộc thi public
 * @param {function} [onAccept]
 * @param {function} [onDecline]
 */
function InvitationCard({ invitation, onAccept, onDecline }) {
  const isJudge = invitation.roleType === 'judge'

  return (
    <article className={styles.card}>
      {/* Thông tin: tên cuộc thi + badge hạng mục */}
      <div className={styles.info}>
        <h4 className={styles.eventName}>{invitation.eventName}</h4>
        <span className={styles.categoryWrap}>
          <Badge
            variant={isJudge ? 'green' : 'orange'}
            label={invitation.scope}
            size="sm"
            dot={false}
          />
        </span>
      </div>

      {/* Mở trang cuộc thi public (có tooltip ghi chú) */}
      <Tooltip content="Mở trang cuộc thi" position="top" bgColor="blue" textColor="white">
        <a
          className={styles.extLink}
          href={invitation.eventLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Mở trang cuộc thi"
        >
          <ArrowSquareOut size={28} weight="regular" />
        </a>
      </Tooltip>

      <div className={styles.divider} />

      {/* Nút hành động — tone blue */}
      <div className={styles.actions}>
        <Button
          label="Đồng ý"
          icon={Check}
          iconWeight="bold"
          iconSize={15}
          labelSize={13}
          variant="primary"
          color="blue"
          className={styles.actionBtn}
          onClick={onAccept}
        />
        <Button
          label="Từ chối"
          icon={X}
          iconWeight="bold"
          iconSize={15}
          labelSize={13}
          variant="outline"
          color="blue"
          className={styles.actionBtn}
          onClick={onDecline}
        />
      </div>
    </article>
  )
}

export default InvitationCard