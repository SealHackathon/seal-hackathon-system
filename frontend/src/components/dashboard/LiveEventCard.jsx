import { useEffect, useState } from 'react'
import { Users, MapPin, Trophy } from '@phosphor-icons/react'
import Button from '../shared/Button'
import StatChip from '../coordinator/StatChip'
import TimelineHorizontal from '../shared/TimelineHorizontal'
import styles from './LiveEventCard.module.css'
import coverPlaceholder from '../../assets/seal_hackathon_poster.png'

function LiveEventCard({ event, isRegistered = false, onJoin, onViewRules }) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (!event) return null

    const registrationDeadline = event.endDate ? new Date(event.endDate) : null
    const isRegistrationClosed = !isRegistered && registrationDeadline && !Number.isNaN(registrationDeadline.getTime())
        ? registrationDeadline.getTime() < now
        : false
    const joinButtonLabel = isRegistered
        ? 'Vào cuộc thi'
        : isRegistrationClosed
            ? 'Đóng đăng ký'
            : 'Tham gia'

    const infoItems = [
        { icon: Users, label: 'Số lượng thành viên', value: event.maxTeamMember ? `3 - ${event.maxTeamMember} người / đội` : 'Chưa cập nhật' },
        { icon: MapPin, label: 'Địa điểm tổ chức', value: event.location || 'Chưa cập nhật' },
        { icon: Trophy, label: 'Tổng giá trị giải thưởng', value: event.prize ? `${Number(event.prize).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật' },
    ]

    const mappedMilestones = event.timeline?.map(m => {
        const dateObj = new Date(m.date);
        const dateStr = Number.isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return {
            date: dateStr,
            label: m.name
        };
    }) || [];

    return (
        <div className={styles.card}>
            <div className={styles.leftSide}>
                {/* Ảnh bìa */}
                <div className={styles.cover}>
                    <img src={event.thumbnailImage || coverPlaceholder} alt="cover"></img>
                </div>
                
                <div className={styles.stats}>
                    <StatChip value={`${event.teamCount || 0} / ${event.maxTeamLimit || event.maxTeamMember || 'Không giới hạn'}`} label={<>Đội thi <span style={{color: '#E55C00'}}>*</span></>} />
                    <StatChip value={`${event.participantCount || 0}`} label="Thí sinh" />
                    <StatChip value={event.trackCount || 0} label="Hạng mục" />
                </div>

                {/* Nút */}
                <div className={styles.actions}>
                    <Button className={styles.btn} label={joinButtonLabel} variant="primary" color="blue" onClick={onJoin} disabled={isRegistrationClosed} />
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

                {/* Timeline */}
                {mappedMilestones.length > 0 && (
                    <div className={styles.section}>
                        <p className={styles.timelineTitle}>Timeline</p>
                        <TimelineHorizontal milestones={mappedMilestones} showToday={true} />
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default LiveEventCard