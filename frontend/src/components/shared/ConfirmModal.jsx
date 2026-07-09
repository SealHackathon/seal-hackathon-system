import { WarningCircle, CheckCircle, Info } from '@phosphor-icons/react'
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
    isNotification = false,
    variant = 'warning', // 'warning', 'success', 'info'
    }) {
    if (!isOpen) return null

    let color = 'orange'
    let Icon = WarningCircle

    if (variant === 'success') {
        color = 'green'
        Icon = CheckCircle
    } else if (variant === 'info') {
        color = 'blue'
        Icon = Info
    }

    return (
        <ModalShell
            size="sm"
            onClose={onCancel}
            footer={
                <div className={styles.actions}>
                    {!isNotification && (
                        <Button className={styles.actionButton} label={denyLabel} variant="outline" color={color} onClick={onCancel} />
                    )}
                    <Button className={styles.actionButton} label={confirmLabel} color={color} onClick={onConfirm} />
                </div>
            }
        >
            <div className={styles.header}>
                <div className={`${styles.iconWrapper} ${styles[variant]}`}>
                    <Icon size={32} weight="fill" />
                </div>
                <p className={`${styles.title} ${styles[variant]}`}>{title}</p>
            </div>
            <p className={styles.message}>{message}</p>
        </ModalShell>
    )
}

export default ConfirmModal