import { ListChecks } from '@phosphor-icons/react';
import JudgeRoundCard from './JudgeRoundCard';
import styles from './JudgeRoundsTab.module.css';

// Nội dung chính tab Giám khảo: danh sách vòng chấm (cột trái).
function JudgeRoundsTab({ event }) {
  const rounds = event.assignment?.judge?.rounds ?? [];

  return (
    <div className={styles.tab}>
      <div className={styles.sectionTitle}>
        <ListChecks size={32} weight="bold" />
        <p>Các vòng chấm</p>
      </div>
      <div className={styles.list}>
        {rounds.map((r, i) => (
          <JudgeRoundCard key={r.id ?? i} round={r} isLast={i === rounds.length - 1} />
        ))}
      </div>
    </div>
  );
}

export default JudgeRoundsTab;
