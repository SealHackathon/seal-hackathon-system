import styles from './AdminSidebar.module.css';

function AdminSidebar({ isOpen, onToggle }) {
  const managementItems = ['Sự kiện', 'Rubric', 'Thông báo', 'Người dùng', 'Lịch trình'];
  const supportItems = ['Xử lý yêu cầu', 'Cài đặt'];

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>SEAL Hackathon</span>
        </div>
      </div>

      {/* Create Event Button */}
      <button className={styles.createEventBtn}>
        <span className={styles.btnIcon}>➕</span>
        Tạo sự kiện
      </button>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Management Section */}
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Quản lý</h3>
          <ul className={styles.navList}>
            {managementItems.map((item) => (
              <li key={item}>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navDot}>•</span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Section */}
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Hỗ trợ</h3>
          <ul className={styles.navList}>
            {supportItems.map((item) => (
              <li key={item}>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navDot}>•</span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default AdminSidebar;
