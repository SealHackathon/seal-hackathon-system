import { useEffect, useRef, useState } from 'react'
import {
  DotsThreeVertical, Eye, Link, DownloadSimple,
  CopySimple, Archive, XCircle, Trash, PencilSimple
} from '@phosphor-icons/react'
import styles from './EventCardMenu.module.css'

/**
 * Logic hiển thị action theo status:
 *
 * | Status     | Hủy      | Xóa       |
 * |------------|-----------|----------|
 * | draft      | Ẩn        | Hiển     |
 * | live       | Hiển      | Ẩn       |
 * | upcoming   | Disable   | Ẩn       |
 * | ended      | Ẩn        | Ẩn       |
 * | cancelled  | Ẩn        | Ẩn       |
 * | archived   | Ẩn        | Ẩn       |
 */
function getDestructiveConfig(status) {
  if (status === 'draft')    return { type: 'delete',  disabled: false }
  if (status === 'live')     return { type: 'cancel',  disabled: false }
  if (status === 'upcoming') return { type: 'cancel',  disabled: true  }
  return null // ẩn hoàn toàn
}

function EventCardMenu({ status, onEdit, onView, onCopyLink, onExport, onDuplicate, onArchive, onCancel, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const destructive = getDestructiveConfig(status)

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Mở menu"
      >
        <DotsThreeVertical size={24} weight="bold" />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {/* === Hộp chính === */}
          <div className={styles.box}>
            <button className={styles.item} onClick={() => { onEdit?.();      setOpen(false) }}>
              <PencilSimple size={24} color="var(--color-primary-blue)" /> Chỉnh sửa
            </button>
            <button className={styles.item} onClick={() => { onView?.();      setOpen(false) }}>
              <Eye size={24} color="var(--color-primary-blue)" /> Xem trang sự kiện
            </button>
            <button className={styles.item} onClick={() => { onCopyLink?.(); setOpen(false) }}>
              <Link size={24} color="var(--color-primary-blue)" /> Sao chép liên kết
            </button>
            <button className={styles.item} onClick={() => { onExport?.();   setOpen(false) }}>
              <DownloadSimple size={24} color="var(--color-primary-blue)" /> Xuất báo cáo
            </button>
            <button className={styles.item} onClick={() => { onDuplicate?.(); setOpen(false) }}>
              <CopySimple size={24} color="var(--color-primary-blue)" /> Nhân bản
            </button>
            <button className={styles.item} onClick={() => { onArchive?.();  setOpen(false) }}>
              <Archive size={24} color="var(--color-primary-blue)" /> Lưu trữ
            </button>

            {/* Hủy — chỉ hiển với live / upcoming */}
            {(destructive?.type === 'cancel') && (
              <button
                className={`${styles.item} ${styles.itemCancel}`}
                disabled={destructive.disabled}
                onClick={() => { onCancel?.(); setOpen(false) }}
              >
                <XCircle size={24} color="#f97316" /> Hủy
              </button>
            )}
          </div>

          {/* === Xóa — chỉ hiển với draft, riêng box === */}
          {destructive?.type === 'delete' && (
            <div className={styles.destructiveBox}>
              <button
                className={styles.itemDestructive}
                onClick={() => { onDelete?.(); setOpen(false) }}
              >
                <Trash size={24} color="#f97316" /> Xóa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCardMenu
