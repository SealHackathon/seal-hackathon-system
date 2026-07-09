import { CalendarBlank, Stack, UsersThree, Tag } from '@phosphor-icons/react';
import styles from './EventMetaBox.module.css';

function fmtDM(d) {
  if (!d) return '--';
  const x = d instanceof Date ? d : new Date(d);
  return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}`;
}

// Box thông tin cuộc thi (cạnh header) - stat tiles chọn lọc, không loè loẹt.
function EventMetaBox({ event }) {
  const stats = [
    { icon: CalendarBlank, value: `${fmtDM(event.timeStart)} – ${fmtDM(event.timeEnd)}`, label: 'Thời gian' },
    { icon: Stack, value: `${event.rounds?.length ?? 0} vòng`, label: 'Số vòng thi' },
    { icon: UsersThree, value: `${event.teamCount ?? 0} đội`, label: 'Đội tham gia' },
    { icon: Tag, value: `${event.trackCount ?? 0} hạng mục`, label: 'Hạng mục' },
  ];

  return (
    <aside className={styles.box}>
      <p className={styles.title}>Tổng quan cuộc thi</p>

      <p className={styles.theme}>
        <span className={styles.themeLabel}>Chủ đề:</span> {event.theme}
      </p>

      <div className={styles.grid}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={styles.tile}>
              <span className={styles.tileIcon}><Icon size={20} weight="fill" /></span>
              <span className={styles.tileText}>
                <span className={styles.tileLabel}>{s.label}</span>
                <span className={styles.tileValue}>{s.value}</span>
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default EventMetaBox;
