import { CheckCircle, XCircle } from '@phosphor-icons/react'
import Tooltip from './Tooltip'
import styles from './SubmissionRing.module.css'

/**
 * SubmissionRing — ring mini thể hiện tiến độ nộp bài theo từng hạng mục.
 * Hover vào ring hiện tooltip trạng thái từng mục.
 *
 * @param {Array}  items        — [{ key, label, done }]
 * @param {number} [size=46]
 * @param {number} [thickness=6]
 */
function SubmissionRing({ items = [], size = 46, thickness = 6 }) {
  const total = items.length
  const doneCount = items.filter((it) => it.done).length

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const half = size / 2
  const gap = total > 1 ? 5 : 0
  const segLen = total > 0 ? circumference / total - gap : circumference

  const wrapStyle = { width: size, height: size }
  const rotate = `rotate(-90 ${half} ${half})`

  const tip = (
    <ul className={styles.tipList}>
      {items.map((it) => (
        <li key={it.key} className={styles.tipItem}>
          {it.done ? (
            <CheckCircle size={16} weight="fill" color="var(--color-primary-green)" />
          ) : (
            <XCircle size={16} weight="fill" color="var(--color-text-muted)" />
          )}
          <span className={styles.tipLabel}>{it.label}</span>
          <span className={it.done ? styles.tipDone : styles.tipPending}>
            {it.done ? 'Đã nộp' : 'Chưa nộp'}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <Tooltip content={tip} bgColor="white" position="top">
      <span className={styles.wrap} style={wrapStyle}>
        <svg width={size} height={size}>
          <g transform={rotate}>
            {items.map((it, i) => {
              const offset = -(i * (segLen + gap))
              return (
                <circle
                  key={it.key}
                  cx={half}
                  cy={half}
                  r={radius}
                  fill="none"
                  stroke={it.done ? 'var(--color-primary-green)' : 'var(--color-bg-blue)'}
                  strokeWidth={thickness}
                  strokeDasharray={`${segLen} ${circumference - segLen}`}
                  strokeDashoffset={offset}
                />
              )
            })}
          </g>
        </svg>
        <span className={styles.count}>
          {doneCount}/{total}
        </span>
      </span>
    </Tooltip>
  )
}

export default SubmissionRing
