import { CalendarBlank, Users, MapPin, Trophy } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './LiveEventCard.module.css'
import coverPlaceholder from '../../assets/seal_hackathon_poster.png'

function formatDateRange(start, end) {
    const formatDate = (value) => {
        if (!value) return 'Chưa cập nhật'

        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    if (start && end) return `${formatDate(start)} - ${formatDate(end)}`
    return formatDate(start || end)
}

function LiveEventCard({ event, onJoin, onViewRules }) {
    if (!event) return null

    const infoItems = [
        { icon: CalendarBlank, label: 'Thời gian thi đấu', value: formatDateRange(event.startDate, event.endDate) },
        { icon: Users, label: 'Số lượng thành viên', value: event.maxTeamMember ? `Tối đa ${event.maxTeamMember} người / đội` : 'Chưa cập nhật' },
        { icon: MapPin, label: 'Địa điểm tổ chức', value: event.location || 'Chưa cập nhật' },
        { icon: Trophy, label: 'Tổng giá trị giải thưởng', value: event.prize ? `${Number(event.prize).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật' },
    ]

    return (
        <div className={styles.card}>
            <div className={styles.leftSide}>
                {/* Ảnh bìa */}
            <div className={styles.cover}>
                {/* {event.coverUrl
                    ? <img src={event.coverUrl} alt={event.name} />
                    : <div className={styles.coverPlaceholder} />
                }  */}
            <img src={coverPlaceholder}></img>
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
                    {infoItems.map((item, i) => (
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