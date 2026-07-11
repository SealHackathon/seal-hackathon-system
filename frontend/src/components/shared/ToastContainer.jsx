import { createPortal } from 'react-dom'
import Toast from './Toast'
import styles from './ToastContainer.module.css'

/**
 * ToastContainer – renders a stack of Toast notifications at the
 * bottom-right of the viewport via a React Portal.
 *
 * @param {{ id, variant, title, message, duration }[]} toasts
 * @param {Function} onClose – called with (id) when a toast is dismissed
 */
function ToastContainer({ toasts = [], onClose, bottom = '6.5rem' }) {
  if (!toasts.length) return null

  return createPortal(
    <div className={styles.container} style={{ bottom }} aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          message={t.message}
          duration={t.duration ?? 5000}
          onClose={() => onClose?.(t.id)}
        />
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer
