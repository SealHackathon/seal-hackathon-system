import { ArrowSquareOut } from '@phosphor-icons/react'
import styles from './MilestoneCardAuto.module.css'

function fmtDate(d) {
    if (!d) return ''
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtTime(d) {
    if (!d) return ''
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function MilestoneCardAuto({ ms }) {
    const timeStr = ms.date
        ? (ms.endDate ? `${fmtTime(ms.date)} – ${fmtTime(ms.endDate)}` : fmtTime(ms.date))
        : ''
    return (
        <div className={styles.card}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <div className={styles.topRow}>
                        <span className={styles.date}>{fmtDate(ms.date)}</span>
                        {timeStr && <span className={styles.time}>{timeStr}</span>}
                    </div>
                    <p className={styles.title}>{ms.title}</p>
                </div>
                <div className={styles.right}>
                    <span className={styles.hint}>Tự động thêm từ</span>
                    <span className={styles.badge}>{ms.source}</span>
                </div>
            </div>

            {ms.meta?.submissionDeadline && (
                <p className={styles.meta}>Hạn nộp bài: {fmtTime(ms.meta.submissionDeadline)} cùng ngày</p>
            )}
            {ms.meta?.location && (
                <p className={styles.meta}>Địa điểm: {ms.meta.location}</p>
            )}
            {ms.meta?.meetingLink && (
                <p className={styles.meta}>
                    Link tham gia:{' '}
                    <a href={ms.meta.meetingLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Xem tại đây <ArrowSquareOut size={11} />
                    </a>
                </p>
            )}
        </div>
    )
}

export default MilestoneCardAuto
