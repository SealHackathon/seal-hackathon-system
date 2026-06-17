import styles from './PendingRequestsList.module.css';

function PendingRequestsList({ requests }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ':
        return styles.pending;
      case 'Phê duyệt':
        return styles.approved;
      case 'Từ chối':
        return styles.rejected;
      default:
        return styles.pending;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Yêu cầu chờ xử lý</h3>
        <span className={styles.count}>{requests.length}</span>
      </div>

      <div className={styles.listContainer}>
        {requests.map((request) => (
          <div key={request.id} className={styles.item}>
            <div className={styles.content}>
              <div className={styles.type}>{request.type}</div>
              <div className={styles.sender}>{request.sender}</div>
              <div className={styles.time}>{request.time}</div>
            </div>
            <span className={`${styles.status} ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className={styles.empty}>Không có yêu cầu nào</div>
      )}
    </div>
  );
}

export default PendingRequestsList;
