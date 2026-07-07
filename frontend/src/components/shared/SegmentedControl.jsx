import styles from './SegmentedControl.module.css';

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className={styles.segmentedControl}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.button} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <opt.icon size={24} weight={value === opt.value ? "bold" : "regular"} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;
