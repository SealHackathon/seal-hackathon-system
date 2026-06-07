import styles from './TeamStatusTag.module.css'

const STATUS_CONFIG = {
  pending:  { label: 'Chưa chốt đội' },
  rejected:  { label: 'Chưa chốt đội' },
  waiting:  { label: 'Chờ BTC duyệt' },
  approved: { label: 'Đã chốt đội'   },
}

function TeamStatusTag({ status = 'pending' }) {
  const config = STATUS_CONFIG[status]

  return (
    <span className={`${styles.tag} ${styles[status]}`}>
      {config.label}
    </span>
  )
}

export default TeamStatusTag