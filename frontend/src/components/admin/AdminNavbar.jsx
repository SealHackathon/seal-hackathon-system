import styles from './AdminNavbar.module.css';

function AdminNavbar({ onToggleSidebar }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.toggleBtn} onClick={onToggleSidebar}>
          <span className={styles.hamburger}>☰</span>
        </button>
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>Bảng điều khiển</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.notificationIcon}>🔔</div>
          <div className={styles.avatar}>👤</div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
