import { useEffect, useRef, useState, useCallback } from 'react'
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
    icon,
    titleColor,
    showBottomOverlay = false
}) {
    // Ref gắn vào vùng content để theo dõi scroll
    const contentRef = useRef(null)
    // Hiện overlay chỉ khi chưa scroll tới đáy
    const [isAtBottom, setIsAtBottom] = useState(false)

    // Kiểm tra xem đã scroll tới đáy chưa
    const checkScroll = useCallback(() => {
        const el = contentRef.current
        if (!el) return
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
        setIsAtBottom(atBottom)
    }, [])

    useEffect(() => {
        document.body.style.overflow = 'hidden'   // khóa scroll khi modal mở

        return () => {
            document.body.style.overflow = ''     // mở lại khi modal đóng
        }
    }, [])

    // Kiểm tra lần đầu khi content mount (trường hợp content ngắn, không cần scroll)
    useEffect(() => {
        checkScroll()
    }, [checkScroll])

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
                                <h3 className={styles.title} style={titleColor ? { color: titleColor } : {}}>{title}</h3>
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

                <div className={styles.contentWrapper}>
                    <div
                        ref={contentRef}
                        className={`${styles.content} ${title ? styles.contentWithHeader : ''}`}
                        style={disableScroll ? { overflow: 'hidden' } : {}}
                        onScroll={checkScroll}
                    >
                        {children}
                    </div>
                    {/* Chỉ hiện overlay khi showBottomOverlay=true VÀ chưa scroll tới đáy */}
                    {showBottomOverlay && !isAtBottom && (
                        <div className={styles.bottomOverlay} />
                    )}
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