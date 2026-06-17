import styles from './EventStatusCard.module.css';

function EventStatusCard({ event }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Sự kiện đang diễn ra</h3>
          <p className={styles.eventName}>{event.name}</p>
        </div>
        <span className={styles.badge}>{event.status}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <p className={styles.label}>Vòng hiện tại</p>
          <p className={styles.roundName}>{event.round}</p>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${event.roundProgress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{event.roundProgress}%</span>
          </div>
        </div>

        <div className={styles.dateGrid}>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Bắt đầu</span>
            <span className={styles.dateValue}>{event.startDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Kết thúc</span>
            <span className={styles.dateValue}>{event.endDate}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>Bài nộp</span>
            <span className={styles.dateValue}>{event.submissions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventStatusCard;
