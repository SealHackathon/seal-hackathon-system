import styles from './NoticeBox.module.css'

function NoticeBox({ 
    color = 'orange', // 'blue', 'orange', 'green'
    icon: Icon,
    message, 
    button, 
    detail 
}) {
  return (
    <div className={`${styles.box} ${styles[color]}`}>

      <div className={styles.main}>
        <div className={styles.left}>
          <span className={styles.icon}><Icon size={32}/></span>
          <span className={styles.message}>{message}</span>
          <div className={styles.divider} />
        </div>

        {button && (
          <>
              <div className={styles.right}>{button}</div>
          </>
        )}
      </div>

      
      {detail && (
        <>
          <hr className={styles.detailDivider} />
          <div className={styles.detail}>{detail}</div>
        </>
      )}

    </div>
  )
}

export default NoticeBox