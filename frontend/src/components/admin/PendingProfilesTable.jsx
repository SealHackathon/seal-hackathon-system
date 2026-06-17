import styles from './PendingProfilesTable.module.css';

function PendingProfilesTable({ profiles }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hồ sơ chờ duyệt</h3>
        <span className={styles.count}>{profiles.length} hồ sơ</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Trường</th>
              <th>Mã sinh viên</th>
              <th>Ngày nộp</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className={styles.name}>{profile.name}</td>
                <td className={styles.school}>{profile.school}</td>
                <td className={styles.studentId}>{profile.studentId}</td>
                <td className={styles.date}>{profile.date}</td>
                <td className={styles.actions}>
                  <button className={`${styles.btn} ${styles.approve}`} title="Duyệt">
                    ✓
                  </button>
                  <button className={`${styles.btn} ${styles.reject}`} title="Từ chối">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingProfilesTable;
