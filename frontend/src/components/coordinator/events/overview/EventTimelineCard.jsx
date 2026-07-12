import { CalendarDots } from '@phosphor-icons/react'
import SectionHeader from '../../../shared/SectionHeader'
import TimelineVertical from '../../../shared/TimelineVertical'
import styles from './EventTimelineCard.module.css'

/**
 * EventTimelineCard — Wrapper card cho TimelineVertical
 *
 * Props:
 *   milestones: Array<{
 *     id, title, date, endDate?,
 *     description?, link?, location?, submissionDeadline?
 *   }>
 *   hasNext: boolean — nếu có roundBox bên dưới, bỏ bo góc dưới của card
 */
function EventTimelineCard({ milestones = [], hasNext = false }) {
  return (
    <div className={styles.container}>
      <SectionHeader icon={CalendarDots} title="Timeline" level="h1" />
      <div className={`${styles.card}${hasNext ? '' : ` ${styles.cardStandalone}`}`}>
        <div className={styles.body}>
          <TimelineVertical milestones={milestones} showToday={true} />
        </div>
      </div>
    </div>
  )
}

export default EventTimelineCard
