import { X, ListPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './RequestDetailModal.module.css'

function RequestDetailModal({ 
    request, 
    onAccept, 
    onReject, 
    onClose 
}) {
  if (!request) return null

  return (
    
    <div className={styles.backdrop} onClick={onClose}>

      
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={32} color="var(--color-text-secondary)" />
        </button>


        <div className={styles.userInfo}>
          <div className={styles.avatar} />
          <div>
            <p className={styles.name}>{request.name}</p>
            <p className={styles.email}>{request.email}</p>
          </div>
        </div>

        
        <div className={styles.messageBox}>
          <ListPlus size={28} className={styles.messageIcon} />
          <p className={styles.message}>{request.message}</p>
        </div>

        
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

      </div>
    </div>
  )
}

export default RequestDetailModal