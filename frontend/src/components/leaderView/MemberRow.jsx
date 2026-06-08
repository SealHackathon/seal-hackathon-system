import { useState } from 'react'
import Tooltip from '../shared/Tooltip'
import { CrownSimple, X, SignOut, HandPalm } from '@phosphor-icons/react'
import styles from './MemberRow.module.css'
import Button from '../shared/Button'
import LeaveRequestDetailModal from './LeaveRequestDetailModal'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'

function MemberRow({
  index,
  name,
  email,
  school,
  isLeader,
  isCurrentUser,
  onKick,
  onPromote,
  onLeave,
  onCancelLeave, // day la member 
  onApproveLeave,
  leaveRequest,
}) {
  const [selectedRequest, setSelectedRequest] = useState(null)

  return (
    <div className={styles.row}>

      <span className={styles.index}>{index}</span>

      <div className={styles.avatar}>
        <img src={avatarPlaceholder} alt="user avatar placeholder" className={styles.avatarImg} />
        {isLeader && (
          <CrownSimple size={32} weight="fill" className={styles.crownIcon} />
        )}
      </div>


      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {isCurrentUser && <span className={styles.youBadge}>(Bạn)</span>}
        </div>
        <span className={styles.email}>{email}</span>
        <span className={styles.school}>{school}</span>
      </div>


      <div className={styles.actions}>

        {
          isCurrentUser ? (
            
            (leaveRequest && onCancelLeave) ? (
                
                <Button
                  label="Hủy yêu cầu rời đội"
                  labelSize={16}
                  variant="outline"
                  color="orange"
                  onClick={onCancelLeave}>
                </Button>

              ) : (
                
                <Tooltip content="Rời đội">
                  <button
                    className={styles.actionBtn}
                    onClick={isLeader ? onLeave : () => setSelectedRequest({ compose: true })}
                    // thêm một trường compose vào request gốc để phân biệt việc gửi leave request của member
                    >
                    <SignOut size={28} weight='bold' color="var(--color-secondary-blue)" />
                  </button>
                </Tooltip>

              )
          ) : (leaveRequest && onApproveLeave) ? (
            
            <Button
              label="Xử lý yêu cầu rời đội"
              labelSize={16} 
              variant="outline"
              icon={HandPalm}
              color="blue"
              onClick={() => setSelectedRequest(leaveRequest)} 
            >

            </Button>
          ) : (onKick || onPromote) ? (
            
            <>
            
              <Tooltip content="Trao quyền" bgColor="orange">
                <button
                  className={styles.actionBtn}
                  onClick={onPromote}> 
                  <CrownSimple size={28} weight='bold' color="var(--color-border-orange)" />
                </button>
              </Tooltip>

              <Tooltip content="Yêu cầu rời đội" bgColor="orange">
                <button
                  className={styles.actionBtn}
                  onClick={onKick}>
                  <X size={28} weight='bold' color="var(--color-border-orange)" />
                </button>
              </Tooltip>

            </>

          ) : null}
      </div>


      <LeaveRequestDetailModal
        request={selectedRequest}
        compose
        onAccept={onApproveLeave}
        onLeave={onLeave}
        onCancelLeave={onCancelLeave}
        onClose={() => setSelectedRequest(null)}
      />
      
        
    </div>
  )
}

export default MemberRow