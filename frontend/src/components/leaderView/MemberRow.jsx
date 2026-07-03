import { useState } from 'react'
import Tooltip from '../shared/Tooltip'
import { CrownSimple, X, SignOut, HandPalm, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import styles from './MemberRow.module.css'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import LeaveRequestDetailModal from './LeaveRequestDetailModal'
import UserProfileModal from './UserProfileModal'
import ConfirmModal from '../shared/ConfirmModal'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'

// Map joinMethod → Badge props — cùng màu green, khác variant theo cấp độ
const JOIN_METHOD_BADGE = {
  JOINBYINVITATION: { variant: 'greenSolid', label: 'Được mời', dim: false },
  JOINBYREQUEST: { variant: 'green', label: 'Xin vào', dim: false },
  JOINBYCODE: { variant: 'dashedGreen', label: 'Dùng mã', dim: true }, // opacity 0.45 qua CSS
}

function MemberRow({
  index,
  teamStatus,
  member,
  name,
  email,
  school,
  isLeader,
  isCurrentUser,
  memberStatus,       // 'OFFICAL' | 'RESERVE'
  joinMethod,         // 'INVITE' | 'REQUEST' | 'CODE' | undefined
  onKick,
  onPromote,
  onLeave,
  onCancelLeave,
  onApproveLeave,
  onMoveToOfficial,   // chỉ truyền vào khi row ở RESERVE
  onMoveToReserve,    // chỉ truyền vào khi row ở OFFICAL (non-leader)
  leaveRequest,
}) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const badge = !isLeader && joinMethod ? JOIN_METHOD_BADGE[joinMethod] : null

  return (
    <div className={styles.row}>

      <span className={styles.index}>{index}</span>

      <div 
        className={`${styles.profileWrapper} ${isCurrentUser ? styles.noHover : ''}`} 
        onClick={() => { isCurrentUser ? {} : setIsProfileOpen(true) }}
        onMouseEnter={() => { if (!isCurrentUser) setIsHovered(true) }}
        onMouseLeave={() => { if (!isCurrentUser) setIsHovered(false) }}
      >

        <Tooltip
          content={isCurrentUser ? '' : "Xem thông tin chi tiết"}
          position="top"
          forceVisible={isHovered}
        >
          <div className={styles.innerWrapper}>
            <div className={styles.avatar}>
              <img src={avatarPlaceholder} alt="user avatar placeholder" className={styles.avatarImg} />
              {isLeader && (
                <CrownSimple size={32} weight="fill" className={styles.crownIcon} />
              )}
            </div>

            <div className={styles.info}>
              <div className={styles.nameRow}>
                <span className={styles.name}>
                  {name}
                </span>
                {isCurrentUser && <span className={styles.youBadge}>(Bạn)</span>}
                {badge && (
                  <span className={badge.dim ? styles.badgeDim : undefined}>
                    <Badge
                      variant={badge.variant}
                      label={badge.label}
                      size="sm"
                      dot={false}
                    />
                  </span>
                )}
              </div>
              <span className={styles.email}>{email}</span>
              <span className={styles.school}>{school}</span>
            </div>
          </div>


        </Tooltip>
      </div>


      {teamStatus === "OPEN" && (
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
                    onClick={() => {
                      if (isLeader) {
                        onLeave();
                      } else if (memberStatus === 'RESERVE') {
                        setShowLeaveConfirm(true);
                      } else {
                        setSelectedRequest({ compose: true });
                      }
                    }}
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
            ) : (
              <>
                {/* Nút chuyển lên hàng chính thức (chỉ show với RESERVE row) */}
                {onMoveToOfficial && (
                  <Tooltip content="Chuyển lên hàng chính thức" bgColor="orange">
                    <button
                      className={styles.actionBtn}
                      onClick={onMoveToOfficial}
                    >
                      <ArrowUp size={28} weight='bold' color="var(--color-border-orange)" />
                    </button>
                  </Tooltip>
                )}

                {/* Nút chuyển xuống hàng dự bị (chỉ show với OFFICAL non-leader row) */}
                {onMoveToReserve && (
                  <Tooltip content="Chuyển xuống hàng dự bị" bgColor="orange">
                    <button
                      className={styles.actionBtn}
                      onClick={onMoveToReserve}
                    >
                      <ArrowDown size={28} weight='bold' color="var(--color-border-orange)" />
                    </button>
                  </Tooltip>
                )}

                {/* Nút trao quyền Leader (chỉ show với OFFICAL non-leader) */}
                {onPromote && (
                  <Tooltip content="Trao quyền" bgColor="orange">
                    <button
                      className={styles.actionBtn}
                      onClick={onPromote}>
                      <CrownSimple size={28} weight='bold' color="var(--color-border-orange)" />
                    </button>
                  </Tooltip>
                )}

                {/* Nút kick */}
                {onKick && (
                  <Tooltip content="Kick khỏi đội" bgColor="orange">
                    <button
                      className={styles.actionBtn}
                      onClick={onKick}>
                      <X size={28} weight='bold' color="var(--color-border-orange)" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
        </div>
      )}



      <LeaveRequestDetailModal
        request={selectedRequest}
        compose
        onAccept={onApproveLeave}
        onLeave={onLeave}
        onCancel={onCancelLeave}
        onClose={() => setSelectedRequest(null)}
      />

      {isProfileOpen && member && (
        <UserProfileModal
          member={member}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={showLeaveConfirm}
        title="Xác nhận rời nhóm"
        message="Bạn có chắc chắn muốn rời nhóm ngay lập tức không? Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onLeave('');
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  )
}

export default MemberRow