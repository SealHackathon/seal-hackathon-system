import styles from './NotificationItem.module.css'

function NotificationItem({ avatar, message, time, isUnread }) {
  return (
    <div className={styles.item}>
      <img src={avatar} alt="" className={styles.avatar} />
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <span className={styles.time}>{time}</span>
      </div>
      {isUnread && <div className={styles.dot} />}
    </div>
  )
}

export default NotificationItem