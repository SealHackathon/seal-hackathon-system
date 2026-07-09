import { useState, useEffect } from 'react'
import styles from './ScoreSlider.module.css'

/**
 * ScoreSlider — ô nhập điểm chính + thanh kéo hỗ trợ, đồng bộ giá trị với nhau.
 * Chế độ readOnly hiển thị mức điểm đã chấm nhưng khoá thao tác.
 *
 * @param {number}   value
 * @param {function} [onChange]  — (num) => void
 * @param {number}   [max=10]
 * @param {number}   [step=0.1]
 * @param {boolean}  [readOnly=false]
 */
function ScoreSlider({ value = null, onChange, max = 10, step = 0.1, readOnly = false }) {
  const isEmpty = value === null || value === undefined || value === ''
  const num = isEmpty ? 0 : Number(value) || 0
  const pct = max > 0 ? (num / max) * 100 : 0
  const fillStyle = { '--pct': pct + '%' }

  const clamp = (n) => Math.min(max, Math.max(0, n))

  const [localVal, setLocalVal] = useState(isEmpty ? '' : String(num))

  useEffect(() => {
    if (isEmpty) {
      if (localVal !== '') setLocalVal('')
    } else {
      if (Number(value) !== Number(localVal)) {
        setLocalVal(String(value))
      }
    }
  }, [value, isEmpty])

  const handleKeyDown = (e) => {
    // Chặn nhập các ký tự text không mong muốn vào input type number
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleInput = (raw) => {
    if (raw === '') {
      setLocalVal('')
      onChange?.(null)
      return
    }
    
    const n = Number(raw)
    if (Number.isNaN(n)) return // Bỏ qua nếu hoàn toàn không phải số

    if (n < 0 || n > max) {
      // Nếu vượt quá giới hạn, ép về giới hạn và force update ô input ngay lập tức
      const clamped = clamp(n)
      setLocalVal(String(clamped))
      onChange?.(clamped)
      return
    }

    // Nằm trong giới hạn hợp lệ -> giữ nguyên chuỗi (để cho phép nhập dấu chấm ".")
    setLocalVal(raw)
    onChange?.(n)
  }

  const handleBlur = () => {
    if (localVal === '') {
      onChange?.(null)
      return
    }
    let n = Number(localVal)
    if (Number.isNaN(n)) n = 0
    // Làm tròn tối đa 2 chữ số thập phân
    n = Math.round(n * 100) / 100
    n = clamp(n)
    setLocalVal(String(n))
    onChange?.(n)
  }

  return (
    <div className={styles.wrap}>
      <input
        type="range"
        className={`${styles.range} ${readOnly ? styles.readOnly : ''}`}
        style={fillStyle}
        min={0}
        max={max}
        step={step}
        value={num}
        placeholder='0'
        disabled={readOnly}
        onChange={(e) => onChange?.(Number(e.target.value))}
      />
      <div className={styles.scoreCell}>
        {readOnly ? (
          <span className={styles.value}>{isEmpty ? '0.00' : num.toFixed(2)}</span>
        ) : (
          <input
            type="number"
            className={styles.scoreInput}
            min={0}
            max={max}
            step={step}
            value={localVal}
            placeholder="0"
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInput(e.target.value)}
            onBlur={handleBlur}
          />
        )}
        <span className={styles.max}>/{max}</span>
      </div>
    </div>
  )
}

export default ScoreSlider