import styles from './ProgressRing.module.css';

// Donut tiến độ vẽ bằng SVG (không dùng gradient), tái sử dụng cho box tóm tắt.
// Màu vòng chạy = prop `color`; màu track / label / total cũng chỉnh được qua prop (mặc định giữ nguyên như cũ).
function ProgressRing({
  value = 0,
  total = 0,
  size = 104,
  stroke = 12,
  color = 'var(--color-primary-blue)',
  trackColor = 'var(--color-bg-grey)',
  labelColor = 'var(--color-text-secondary)',
  totalColor = 'var(--color-text-secondary)',
  label,
  labelPosition = 'bottom',
  valueLayout = 'stacked', // 'stacked' (mặc định) | 'inline'
}) {
  const center = size / 2;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;
  const dash = circ * pct;
  const ringStyle = { width: size, height: size };
  const trackStyle = { stroke: trackColor };
  const totalStyle = { color: totalColor };
  const labelStyle = { color: labelColor };

  return (
    <div className={styles.wrap}>
      <div className={styles.ring} style={ringStyle}>
        <svg width={size} height={size}>
          <circle
            className={styles.trackCircle}
            style={trackStyle}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className={styles.center}>
          <div className={`${styles.valueWrapper} ${valueLayout === 'inline' ? styles.valueInline : styles.valueStacked}`}>
            <span className={styles.value}>{value}</span>
            <span className={styles.total} style={totalStyle}>/ {total}</span>
          </div>
          {label && labelPosition === 'inner' && (
            <span className={styles.innerLabel} style={labelStyle}>{label}</span>
          )}
        </div>
      </div>
      {label && labelPosition === 'bottom' && <p className={styles.label} style={labelStyle}>{label}</p>}
    </div>
  );
}

export default ProgressRing;