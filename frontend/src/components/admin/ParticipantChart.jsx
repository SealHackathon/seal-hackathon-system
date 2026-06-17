import styles from './ParticipantChart.module.css';

function ParticipantChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.participants));
  const scale = 200 / maxValue;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tham gia theo sự kiện</h3>
        <span className={styles.period}>Tất cả sự kiện</span>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          {data.map((item, idx) => {
            const height = item.participants * scale;
            return (
              <div key={idx} className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div 
                    className={styles.bar}
                    style={{ height: `${height}px` }}
                    title={`${item.participants} tham gia`}
                  ></div>
                </div>
                <span className={styles.label}>{item.event}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.yAxis}>
          <div className={styles.yLabel}>{maxValue}</div>
          <div className={styles.yLabel}>{Math.floor(maxValue / 2)}</div>
          <div className={styles.yLabel}>0</div>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#084CDD' }}></span>
          <span className={styles.legendText}>Số lượng tham gia</span>
        </div>
      </div>
    </div>
  );
}

export default ParticipantChart;
