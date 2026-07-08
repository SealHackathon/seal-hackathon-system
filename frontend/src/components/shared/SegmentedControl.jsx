import styles from './SegmentedControl.module.css';

function SegmentedControl({ options, value, onChange, variant = 'default' }) {
  const isPrimary = variant === 'primary';
  return (
    <div className={`${styles.segmentedControl} ${isPrimary ? styles.primary : ''}`}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        // Màu icon theo variant (bản primary dùng tông sáng hơn vì thân nền đậm).
        const iconColor = isPrimary
          ? (isActive ? 'var(--color-primary-blue)' : 'var(--color-border-blue)')
          : (isActive ? 'var(--color-border-blue)' : 'var(--color-secondary-blue)');
        return (
          <button
            key={opt.value}
            type="button"
            className={`${styles.button} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon && <opt.icon size={24} weight={isActive ? "fill" : "regular"} color={iconColor} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;