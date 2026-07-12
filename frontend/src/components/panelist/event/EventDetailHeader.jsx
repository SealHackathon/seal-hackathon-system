import { ArrowSquareOut, FlagBanner } from '@phosphor-icons/react';
import StatusBadge from '../../coordinator/StatusBadge';
import Tooltip from '../../shared/Tooltip';
import styles from './EventDetailHeader.module.css';

// Header xanh primary: Trạng thái + Tên + Chủ đề.
// Icon mở trang sự kiện nằm ở góc trên bên phải, ngay trong header.
function EventDetailHeader({ event }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroTop}>
        <StatusBadge status={event.status || 'live'} size="sm" />
        <Tooltip content="Xem trang sự kiện" position="left" bgColor='white' textColor='blueTxt'>
          <a
            className={styles.extLink}
            href={event.eventLink || '#'}
            target="_blank"
            rel="noreferrer"
            aria-label="Xem trang sự kiện"
          >
            <ArrowSquareOut size={20} weight="bold" />
          </a>
        </Tooltip>
      </div>

      <div className={styles.titleRow}>
        <FlagBanner weight='fill' className={styles.title}/>
        <h1 className={styles.title}>{event.name}</h1>  
      </div>
    </section>
  );
}

export default EventDetailHeader;
