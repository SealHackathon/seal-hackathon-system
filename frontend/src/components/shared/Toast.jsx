import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Warning, Info, X } from '@phosphor-icons/react'
import styles from './Toast.module.css'

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle,
    iconClass: 'iconSuccess',
    wrapperClass: 'toastSuccess',
    timerClass: 'timerSuccess',
  },
  warning: {
    icon: Warning,
    iconClass: 'iconWarning',
    wrapperClass: 'toastWarning',
    timerClass: 'timerWarning',
  },
  info: {
    icon: Info,
    iconClass: 'iconInfo',
    wrapperClass: 'toastInfo',
    timerClass: 'timerInfo',
  },
}

/**
 * Toast – Floating notification
 * @param {'success'|'warning'|'info'} variant
 * @param {string} title
 * @param {string} message
 * @param {number} duration  – ms before auto-close (default 5000)
 * @param {Function} onClose – called when toast is dismissed
 */
function Toast({ variant = 'info', title, message, duration = 5000, onClose }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)

  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info
  const Icon = cfg.icon

  function dismiss() {
    setExiting(true)
    clearTimeout(timerRef.current)
    // Wait for exit animation before removing
    setTimeout(() => onClose?.(), 350)
  }

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, duration)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`${styles.toast} ${styles[cfg.wrapperClass]} ${exiting ? styles.exiting : styles.entering}`}>
      {/* ── Timer fill: colored panel slides right over duration ── */}
      <div
        className={`${styles.timerFill} ${styles[cfg.timerClass]}`}
        style={{ animationDuration: `${duration}ms` }}
      />

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Icon */}
        <div className={`${styles.iconWrap} ${styles[cfg.iconClass]}`}>
          <Icon size={32} weight="fill" />
        </div>

        {/* Text */}
        <div className={styles.textGroup}>
          {title && <p className={styles.title}>{title}</p>}
          {message && <p className={styles.message}>{message}</p>}
        </div>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={dismiss} aria-label="Đóng thông báo">
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  )
}

export default Toast
