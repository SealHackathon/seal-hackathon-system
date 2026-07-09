import { ClockCounterClockwise } from '@phosphor-icons/react'
import styles from './AuditLog.module.css'

export default function AuditLog({ logs = [] }) {
  if (!logs || logs.length === 0) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>
        <ClockCounterClockwise size={16} weight="bold" /> 
        Lịch sử chỉnh sửa
      </h3>
      
      <div className={styles.timeline}>
        {/* Đường nối dọc */}
        <div className={styles.line}></div>

        {logs.map((log, index) => (
          <div key={index} className={styles.logItem}>
            <div className={`${styles.dot} ${index === 0 ? styles.dotActive : ''}`}></div>
            <p className={styles.userName}>{log.userName}</p>
            <p className={styles.action}>{log.action}</p>
            <p className={styles.time}>{log.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
