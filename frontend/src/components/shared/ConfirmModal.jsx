import Button from './Button'
import ModalShell from './ModalShell'
import styles from './ConfirmModal.module.css'

function ConfirmModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmLabel = 'Đồng ý', 
    denyLabel = 'Hủy',
    }) {
    if (!isOpen) return null

    return (
        <ModalShell
            size="sm"
            onClose={onCancel}
            footer={
                <div className={styles.actions}>
                    <Button label={denyLabel} variant="outline" color='orange' onClick={onCancel} />
                    <Button label={confirmLabel} color='orange' onClick={onConfirm} />
                </div>
            }
        >
            <p className={styles.title}>{title}</p>
            <p className={styles.message}>{message}</p>
        </ModalShell>
    )
}

export default ConfirmModal