import { useRef, useState, useCallback, useEffect } from 'react'
import styles from './ResizableSplit.module.css'

/**
 * ResizableSplit — chia đôi khu vực theo chiều ngang, kéo thanh giữa để đổi tỉ lệ.
 * Không cần thư viện ngoài (dùng Pointer Events). Dưới breakpoint sẽ tự xếp dọc.
 *
 * @param {React.ReactNode} left
 * @param {React.ReactNode} right
 * @param {number} [initialLeft=54]  — % chiều rộng pane trái ban đầu
 * @param {number} [min=32]          — % nhỏ nhất mỗi pane
 * @param {number} [max=68]          — % lớn nhất pane trái
 * @param {string} [storageKey]      — nếu có, ghi nhớ tỉ lệ vào localStorage
 */
function ResizableSplit({ left, right, initialLeft = 54, min = 32, max = 68, storageKey }) {
  const containerRef = useRef(null)
  const [leftPct, setLeftPct] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = Number(window.localStorage.getItem(storageKey))
      if (saved >= min && saved <= max) return saved
    }
    return initialLeft
  })
  const [dragging, setDragging] = useState(false)

  // Cập nhật tỉ lệ theo vị trí con trỏ.
  const onMove = useCallback(
    (clientX) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      let pct = ((clientX - rect.left) / rect.width) * 100
      pct = Math.min(max, Math.max(min, pct))
      setLeftPct(pct)
    },
    [min, max],
  )

  // Lắng nghe kéo/thả ở cấp window để không mất chuột khi ra ngoài pane.
  useEffect(() => {
    if (!dragging) return
    const handleMove = (e) => onMove(e.clientX)
    const handleUp = () => setDragging(false)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging, onMove])

  // Ghi nhớ tỉ lệ.
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(Math.round(leftPct)))
    }
  }, [leftPct, storageKey])

  const leftStyle = { flexBasis: `${leftPct}%` }
  const rightStyle = { flexBasis: `${100 - leftPct}%` }

  return (
    <div ref={containerRef} className={`${styles.split} ${dragging ? styles.dragging : ''}`}>
      <div className={styles.pane} style={leftStyle}>
        {left}
      </div>

      <div
        className={styles.handle}
        role="separator"
        aria-orientation="vertical"
        title="Kéo để đổi tỉ lệ · nhấp đúp để đặt lại"
        onPointerDown={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDoubleClick={() => setLeftPct(initialLeft)}
      >
        <span className={styles.grip} />
      </div>

      <div className={styles.pane} style={rightStyle}>
        {right}
      </div>
    </div>
  )
}

export default ResizableSplit
