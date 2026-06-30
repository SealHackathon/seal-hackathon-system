import styles from './TeamStatusTag.module.css'

const STATUS_CONFIG = {
  OPEN:  { label: 'Chưa chốt đội' },
  REJECTED:  { label: 'Chưa chốt đội' },
  PENDING_APPROVAL:  { label: 'Chờ BTC duyệt' },
  APPROVED: { label: 'Đã chốt đội'   },

}

function TeamStatusTag({ status = 'OPEN' }) {

    console.log("TeamStatusTag status =", status);

  const config = STATUS_CONFIG[status]

  return (
    <span className={`${styles.tag} ${styles[status]}`}>
      {config.label}
    </span>
  )
}

export default TeamStatusTag