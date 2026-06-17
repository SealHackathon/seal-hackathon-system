import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import styles from './AdminLayout.module.css';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.adminPage}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.mainContent}>
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className={styles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
