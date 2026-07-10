import { UsersThree, MapPin, Trophy } from '@phosphor-icons/react'
import StatusBadge from './StatusBadge'
import MetaChip from './MetaChip'
import TagList from './TagList'
import EventCardMenu from './EventCardMenu'
import Button from '../shared/Button'
import StatChip from './StatChip'
import TimelineHorizontal from '../shared/TimelineHorizontal'
import styles from './EventCard.module.css'

/**
 * EventCard
 *
 * @param {object}   event
 * @param {string}   event.id
 * @param {string}   event.title
 * @param {string}   event.theme           - Chủ đề
 * @param {string}   event.status          - live | upcoming | ended | draft | cancelled | archived
 * @param {string}   [event.thumbnail]     - URL ảnh bìa
 * @param {string}   event.teamSize        - vd "3 - 5 người / đội"
 * @param {string[]} event.venues          - danh sách địa điểm
 * @param {string}   event.prize           - Tổng giải thưởng
 * @param {string[]} event.tags
 * @param {object[]} [event.timeline]      - [{date, label, done, active}] — chỉ truyền khi live
 * @param {number}   event.teamCount
 * @param {number}   event.participantCount
 * @param {number}   event.categoryCount
 * @param {number}   event.roundCount
 * @param {function} onManage              - click "Quản lí sự kiện"
 * @param {function} [onView]
 * @param {function} [onCopyLink]
 * @param {function} [onExport]
 * @param {function} [onDuplicate]
 * @param {function} [onArchive]
 * @param {function} [onCancel]
 * @param {function} [onDelete]
 * @param {function} [onEdit]
 */
function EventCard({ event, onManage, onEdit, onView, onCopyLink, onExport, onDuplicate, onArchive, onCancel, onDelete }) {
  const {
    title, theme, status, thumbnail,
    teamSize, venues = [], prize, tags = [],
    timeline = [], teamCount, participantCount, categoryCount, roundCount,
  } = event

  // Venues: hiển thị giống TagList nhưng tooltip là full list
  const venueLabel = venues[0] ?? ''
  const venueTooltip = venues.join(' • ')

  return (
    <div className={styles.card}>
      {/* --- Thumbnail --- */}
      <div className={styles.thumbnail}>
        {thumbnail
          ? <img src={thumbnail} alt={title} />
          : <span>No image</span>
        }
      </div>

      <div className={styles.mainSection}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          <StatusBadge status={status} />
        </div>

        <div className={styles.content}>
          {/* --- Body --- */}
          <div className={styles.body}>


            <p className={styles.theme}><span className={styles.themeTitle}>Chủ đề</span>{theme}</p>

            <div className={styles.summaryInfoContainer}>
              <div className={styles.metaRow}>
                <MetaChip
                  icon={<UsersThree size={24} weight='fill' />}
                  label="Số lượng thành viên"
                  value={teamSize}
                />
                <MetaChip
                  icon={<MapPin size={24} weight='fill' />}
                  label="Địa điểm tổ chức"
                  value={venues.length > 1 ? `${venues[0]} +${venues.length - 1}` : venues[0]}
                  tooltip={venues.join(' • ')}
                />
                <MetaChip
                  icon={<Trophy size={24} weight='fill' />}
                  label="Tổng giá trị giải thưởng"
                  value={prize}
                />
              </div>

              <div className={styles.tagsRow}>
                <TagList tags={tags} maxVisible={4} />
              </div>
            </div>
          </div>

          {/* --- Right panel --- */}
          <div className={styles.right}>

            {/* Timeline — chỉ hiển khi live và có dữ liệu */}
            {status === 'live' && timeline.length > 0 && (
              <TimelineHorizontal milestones={timeline} showToday={true} />
            )}

            <div className={styles.rightBottom}>
              {/* Stats */}
              <div className={styles.stats}>
                <StatChip
                  value={`${teamCount} / 100`}
                  label="Đội thi"
                />
                <StatChip
                  value={`${participantCount} / 500`}
                  label="Thí sinh"
                />
                <StatChip
                  value={categoryCount}
                  label="Hạng mục"
                />
                <StatChip
                  value={roundCount}
                  label="Vòng"
                />
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <Button label="Quản lí sự kiện" labelSize={16} variant="outline" onClick={onManage} />
                <EventCardMenu
                  status={status}
                  onEdit={onEdit}
                  onView={onView}
                  onCopyLink={onCopyLink}
                  onExport={onExport}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                  onCancel={onCancel}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
