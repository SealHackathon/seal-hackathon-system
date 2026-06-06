import { CalendarBlank, Users, MapPin, Trophy } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './LiveEventCard.module.css'

const INFO_ITEMS = [
    { icon: CalendarBlank, label: 'Thời gian thi đấu',        value: '20/07/2026 - 21/07/2026' },
    { icon: Users,         label: 'Số lượng thành viên',      value: '3 - 5 người / đội'       },
    { icon: MapPin,        label: 'Địa điểm tổ chức',         value: 'Đại học FPT'             },
    { icon: Trophy,        label: 'Tổng giá trị giải thưởng', value: '16.500.000 VNĐ'          },
]

function LiveEventCard({ event, onJoin, onViewRules }) {
    if (!event) return null

    return (
        <div className={styles.card}>
            <div className={styles.leftSide}>
                {/* Ảnh bìa */}
            <div className={styles.cover}>
                {event.coverUrl
                    ? <img src={event.coverUrl} alt={event.name} />
                    : <div className={styles.coverPlaceholder} />
                }
            </div>
            {/* Nút */}
                <div className={styles.actions}>
                    <Button className={styles.btn} label="Tham gia" variant="primary" color="blue" onClick={onJoin}      />
                    <Button className={styles.btn} label="Chi tiết thể lệ" variant="outline" color="blue" onClick={onViewRules} />
                </div>
            </div>

            {/* Nội dung */}
            <div className={styles.rightSide}>
                <h1 className={styles.title}>{event.name}</h1>

                {/* Info row */}
                <div className={styles.infoRow}>
                    {INFO_ITEMS.map((item, i) => (
                        <div key={i} className={styles.infoItem}>
                            <item.icon size={28} weight="fill" color="var(--color-secondary-blue)" />
                            <div>
                                <p className={styles.infoLabel}>{item.label}</p>
                                <p className={styles.infoValue}>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chủ đề */}
                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Chủ đề</p>
                    <p className={styles.sectionValue}>{event.topic}</p>
                </div>

                {/* Giới thiệu */}
                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Giới thiệu</p>
                    <p className={styles.sectionValue}>{event.description}</p>
                </div>

                
            </div>
        </div>
    )
}

export default LiveEventCard