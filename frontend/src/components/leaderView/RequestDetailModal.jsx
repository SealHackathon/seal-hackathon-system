import { X, ListPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import ModalShell from '../shared/ModalShell'
import FormTextarea from '../shared/FormTextarea'
import TeamInfoPanel from '../noTeamView/TeamInfoPanel'
import styles from './RequestDetailModal.module.css'

function RequestDetailModal({
  request,
  invite,
  isTeamInvite,
  onAccept,
  onReject,
  onClose
}) {
  const data = isTeamInvite ? invite : request
  if (!data) return null

  return (

    <ModalShell
      size={isTeamInvite ? 'md' : 'sm'}
      onClose={() => { onClose() }}

      //  Sử dụng Footer để 2 cái button không ảnh hưởng đến width của nội dung
      //  Nếu không thì nó sẽ hiển thị scrollbar 
      //  (Ấn nút Đồng ý -> Nó bị dài nội dung ra -> Scrollbar xuất hiện nhìn không được đẹp)
      footer={
        <div className={styles.actions}>
          <Button
            label="Từ chối"
            variant="outline"
            color='grey'
            onClick={() => { onReject(request.id); onClose() }}
          />
          <Button
            label="Đồng ý"
            variant="primary"
            color='green'
            onClick={() => { onAccept(request.id); onClose() }}
          />
        </div>
      }
    >
      <div className={styles.content}>
        {/* Là lời nhắn từ thí sinh sẽ hiện thị cái này (Thông tin thí sinh)*/}
        {!isTeamInvite && (
          <div className={styles.userInfo}>
            <div className={styles.avatar} />
            <div>
              <p className={styles.name}>{data.name}</p>
              <p className={styles.email}>{data.email}</p>
            </div>
          </div>
        )}

        {/* Còn là lời nhắn từ Leader sẽ hiển thị thông tin Team của Leader đó */}
        {isTeamInvite && (
          <div className={styles.teamInfoCard}>
            <TeamInfoPanel team={data.team} />
          </div>
        )}


        <div>
          <p className={styles.title}>{isTeamInvite ? 'Lời nhắn từ đội trưởng' : 'Lời nhắn dành đến đội của bạn'}</p>
          <FormTextarea
            className={styles.message}
            iconLeft={ListPlus}
            value={data.message}
            onChange={() => { }}
            disabled
          />
        </div>

      </div>
    </ModalShell>

  )
}

export default RequestDetailModal