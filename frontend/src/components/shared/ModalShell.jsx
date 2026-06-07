import { X } from '@phosphor-icons/react'
import styles from './ModalShell.module.css'

function ModalShell({
    onClose,
    children,
    footer,
    size = 'md' // 'sm', 'md', 'lg', 'xl'
}) {
    return (
        <div className={`${styles.backdrop} ${'scrollbar'}`} onClick={onClose}>
            <div
                className={`${styles.card} ${styles[size]}`}
                onClick={e => e.stopPropagation()}
            >
                {onClose && (
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} color="var(--color-text-secondary)" />
                    </button>
                )}

                <div className={styles.content}>
                    {children}
                </div>

                {footer && (
                    <div className={styles.footer}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModalShell