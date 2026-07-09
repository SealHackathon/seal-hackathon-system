import { useState, useMemo } from 'react'
import styles from './DonutChart.module.css'

// Toạ độ điểm trên đường tròn theo góc (độ), gốc 0 ở đỉnh (12 giờ).
function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

// Tạo path cung tròn từ startAngle -> endAngle (theo chiều kim đồng hồ).
function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, startAngle)
  const end = polar(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

/**
 * DonutChart — biểu đồ tròn dạng donut, chia theo từng segment.
 * Vẽ bằng arc path để các segment không bị hở/lệch mép.
 * Hover vào segment (hoặc legend) sẽ hiện tooltip; có thể kèm note phụ.
 *
 * @param {Array}   segments        — [{ key, label, value, color, note? }]
 * @param {number}  [size=180]       — đường kính (px)
 * @param {number}  [thickness=24]   — độ dày vành donut (px)
 * @param {string}  [centerLabel]    — nhãn nhỏ ở giữa (vd 'đội phụ trách')
 * @param {boolean} [showLegend=true]
 */
function DonutChart({ segments = [], size = 180, thickness = 24, centerLabel, showLegend = true }) {
  const [hovered, setHovered] = useState(null)

  const radius = (size - thickness) / 2
  const half = size / 2

  const total = useMemo(
    () => segments.reduce((sum, s) => sum + (s.value || 0), 0),
    [segments],
  )

  // ── Tính góc bắt đầu/kết thúc cho từng segment ──
  const arcs = useMemo(() => {
    let angle = 0
    return segments.map((seg) => {
      const frac = total > 0 ? (seg.value || 0) / total : 0
      const start = angle
      const end = angle + frac * 360
      angle = end
      return { ...seg, start, end }
    })
  }, [segments, total])

  const active = hovered != null ? arcs[hovered] : null
  const areaStyle = { width: size, height: size }

  // Một segment chiếm toàn bộ -> vẽ hẳn vòng tròn (arc path không vẽ được 360°).
  const single = arcs.length === 1

  return (
    <div className={styles.wrap}>
      <div className={styles.chartArea} style={areaStyle}>
        {active && (
          <div className={styles.tooltip}>
            <span>
              {active.label}: <strong>{active.value} đội</strong>
            </span>
            {active.note && <span className={styles.tooltipNote}>{active.note}</span>}
          </div>
        )}

        <svg width={size} height={size} className={styles.svg}>
          {(total === 0 || single) && (
            <circle
              cx={half}
              cy={half}
              r={radius}
              fill="none"
              stroke={single ? arcs[0].color : 'var(--color-bg-blue)'}
              strokeWidth={thickness}
            />
          )}
          {!single &&
            arcs.map((a, i) => (
              <path
                key={a.key}
                d={arcPath(half, half, radius, a.start, a.end)}
                fill="none"
                stroke={a.color}
                strokeWidth={hovered === i ? thickness + 4 : thickness}
                className={styles.seg}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
        </svg>

        <div className={styles.center}>
          <span className={styles.centerValue}>{total}</span>
          {centerLabel && <span className={styles.centerLabel}>{centerLabel}</span>}
        </div>
      </div>

      {showLegend && (
        <ul className={styles.legend}>
          {segments.map((seg, i) => {
            const dotStyle = { background: seg.color }
            return (
              <li
                key={seg.key}
                className={styles.legendItem}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={styles.legendDot} style={dotStyle} />
                <span className={styles.legendLabel}>{seg.label}</span>
                <span className={styles.legendValue}>{seg.value}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DonutChart