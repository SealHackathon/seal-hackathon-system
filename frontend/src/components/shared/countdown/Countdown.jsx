import { useState, useEffect } from 'react'
import Counter from './Counter'
import styles from './Countdown.module.css'

function getTimeLeft(targetDate) {
    const distance = targetDate - new Date()

    if (distance < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
        days:    Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
    }
}

function digits(value) {
    const str = String(value).padStart(2, '0')
    return [parseInt(str[0]), parseInt(str[1])]
}

function Countdown( {target} ) {
    const [time, setTime] = useState(getTimeLeft(target))

    useEffect(() => {
        setTime(getTimeLeft(target)) 
        // cập nhật ngay khi target thay đổi, tránh trường hợp user chuyển tab quá lâu -> countdown bị sai lệch

        const timer = setInterval(() => setTime(getTimeLeft(target)), 1000)
        return () => clearInterval(timer) 
        // khi user chuyển trang -> component Countdown bị xóa, 
        // nhưng Countdown vẫn chạy ngầm nếu không clearInterval -> Tốn bộ nhớ, gây giật lag nếu xài web lâu 
    }, [target])

    return (
        <div className={styles.countdown}>
            <Unit label="Ngày"   value={time.days} />
            <span className={styles.sep}>:</span>
            <Unit label="Giờ"    value={time.hours} />
            <span className={styles.sep}>:</span>
            <Unit label="Phút"   value={time.minutes} />
            <span className={styles.sep}>:</span>
            <Unit label="Giây"   value={time.seconds} />
        </div>
    )
}

function Unit({ label, value }) {
    const [d0, d1] = digits(value)
    return (
        <div className={styles.unit}>
            <div className={styles.rollers}>
                <Counter number={d0} />
                <Counter number={d1} />
            </div>
            <p className={styles.label}>{label}</p>
        </div>
    )
}

export default Countdown