import ProgressRing from '../../shared/ProgressRing';
import Badge from '../../shared/Badge';
import Tooltip from '../../shared/Tooltip';
import styles from './JudgeSidebar.module.css';

function JudgeSidebar({ event }) {
  const rounds = event.assignment?.judge?.rounds ?? [];
  const assigned = rounds.filter((r) => r.assigned !== false);
  const totalScored = assigned.reduce((s, r) => s + (r.scoredQuantity ?? 0), 0);
  const totalNeeded = assigned.reduce((s, r) => s + (r.submissionQuantity ?? 0), 0);
  const activeRound = assigned.find((r) => r.lifecycle === 'active');

  return (
    <section className={styles.card}>
      <p className={styles.cardTitle}>Tiến độ chấm của bạn</p>

      <div className={styles.ringWrap}>
        <ProgressRing
          value={totalScored}
          total={totalNeeded}
          label="Tổng tiến độ chấm"
          size={132}
          stroke={14}
          color="var(--color-primary-blue)"
          trackColor="var(--color-bg-blue)"
          labelColor="var(--color-secondary-blue)"
          totalColor="var(--color-secondary-blue)"
        />
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Vòng phụ trách</span>
          <Badge variant="blueSolid" size="sm" dot={false} label={`${assigned.length} vòng`} />
        </div>

        {assigned.length > 0 && (
          <div className={styles.roundList}>
            {assigned.map((r) => {
              const cats = r.allCategories ? ['Tất cả hạng mục'] : (r.categories ?? []);
              const tip = cats.length ? cats.join(', ') : 'Chưa có hạng mục';
              return (
                <Tooltip key={r.id} content={tip} position="top" bgColor="blue" textColor="white">
                  <span className={styles.roundItem}>{r.name}</span>
                </Tooltip>
              );
            })}
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.rowLabel}>Vòng đang diễn ra</span>
          <span className={styles.rowValueBlue}>{activeRound ? activeRound.name : '—'}</span>
        </div>
      </div>
    </section>
  );
}

export default JudgeSidebar;