import styles from './StatCard.module.css';

function StatCard({ label, value, trend, icon }) {
  const isPositive = trend.startsWith('+');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
          {trend}
        </span>
      </div>

      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
