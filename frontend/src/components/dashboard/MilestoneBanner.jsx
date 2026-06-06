import Countdown from '../shared/countdown/Countdown'
import { WarningCircle } from '@phosphor-icons/react'
import styles from './MilestoneBanner.module.css'

// Tự tìm cột mốc tiếp theo chưa qua
function getNextMilestone(timeline) {
    const now = Date.now()
    return timeline
        .filter(m => new Date(m.date).getTime() > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null
}

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
    })
}

function MilestoneBanner({ timeline = [], milestone = null }) {
    // Dùng milestone truyền thẳng vào, hoặc tự tìm cái tiếp theo
    const target = milestone ?? getNextMilestone(timeline)

    if (!target) return null

    const targetTime = new Date(target.date).getTime()
    const isUrgent   = targetTime - Date.now() < 24 * 60 * 60 * 1000  // < 24h

    return (
        <div className={`${styles.banner} ${isUrgent ? styles.urgent : ''}`}>
            <div className={styles.left}>
                <h1 className={styles.title}>
                    <strong className={styles.name}>{target.name}</strong> sẽ diễn ra vào{' '}
                    <strong className={styles.date}>{formatDate(target.date)}</strong>
                </h1>
                {target.note && (
                    <p className={`${styles.note} ${'icon-label'}`}>
                        <WarningCircle size={28} />
                        {target.note}
                    </p>
                )}
            </div>

            <Countdown target={targetTime} />
        </div>
    )
}

export default MilestoneBanner