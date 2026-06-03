import { X, ListPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './RequestDetailModal.module.css'
import ModalShell from '../shared/ModalShell'
import FormTextarea from '../shared/FormTextarea'

function RequestDetailModal({
  request,
  onAccept,
  onReject,
  onClose
}) {
  if (!request) return null

  return (

    <ModalShell
      size='sm'
      onClose={() => { }}

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
        <div className={styles.userInfo}>
          <div className={styles.avatar} />
          <div>
            <p className={styles.name}>{request.name}</p>
            <p className={styles.email}>{request.email}</p>
          </div>
        </div>

        <FormTextarea
          className={styles.message}
          iconLeft={ListPlus}
          value={request.message}
          onChange={() => { }}
          disabled
        />

      </div>
    </ModalShell>

  )
}

export default RequestDetailModal