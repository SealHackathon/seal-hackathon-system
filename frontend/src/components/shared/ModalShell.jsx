import { useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import styles from './ModalShell.module.css'

function ModalShell({
    onClose,
    children,
    footer,
    size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
    disableScroll = false,
    title,
    subtitle,
    icon
}) {

    useEffect(() => {
        document.body.style.overflow = 'hidden'   // khóa scroll khi modal mở

        return () => {
            document.body.style.overflow = ''     // mở lại khi modal đóng
        }
    }, [])

    return (
        <div className={`${styles.backdrop} ${'scrollbar'}`} onClick={onClose} data-lenis-prevent="true">
            <div
                className={`${styles.card} ${styles[size]}`}
                onClick={e => e.stopPropagation()}
            >
                {title ? (
                    <div className={styles.header}>
                        <div className={styles.headTitle}>
                            {icon && <span className={styles.headIcon}>{icon}</span>}
                            <div>
                                <h3 className={styles.title}>{title}</h3>
                                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                            </div>
                        </div>
                        {onClose && (
                            <button className={`${styles.closeBtn} ${styles.closeBtnInHeader}`} onClick={onClose}>
                                <X size={24} color="var(--color-text-secondary)" />
                            </button>
                        )}
                    </div>
                ) : (
                    onClose && (
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} color="var(--color-text-secondary)" />
                        </button>
                    )
                )}

                <div
                    className={`${styles.content} ${title ? styles.contentWithHeader : ''}`}
                    style={disableScroll ? { overflow: 'hidden' } : {}}
                >
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