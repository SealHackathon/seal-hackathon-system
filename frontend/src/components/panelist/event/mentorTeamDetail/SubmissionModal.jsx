import { createPortal } from 'react-dom'
import { X, Package } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import SubmissionPanel from '../../scoring/SubmissionPanel'
import styles from './SubmissionModal.module.css'

/**
 * SubmissionModal — popup xem bài nộp của đội ở một vòng.
 * Tái sử dụng SubmissionPanel (tab GitHub / Slide / Video) đã viết.
 *
 * @param {boolean}  open
 * @param {function} onClose
 * @param {object}   round       — { name, submission, submittedAt, late }
 */
function SubmissionModal({ open, onClose, round }) {
  if (!open || !round) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} data-lenis-prevent="true" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headTitle}>
            <Package size={22} weight="fill" className={styles.headIcon} />
            <div>
              <p className={styles.title}>Bài nộp · {round.name}</p>
              <p className={styles.sub}>
                {round.late ? (
                  <Badge variant="orange" size="sm" dot={false} label="Nộp trễ" />
                ) : (
                  <Badge variant="green" size="sm" dot={false} label="Đã nộp" />
                )}
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body — panel bài nộp */}
        <div className={styles.body}>
          <SubmissionPanel submission={round.submission ?? {}} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default SubmissionModal
