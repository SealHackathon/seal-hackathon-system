import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import StatCard from '../components/admin/StatCard';
import EventStatusCard from '../components/admin/EventStatusCard';
import ParticipantChart from '../components/admin/ParticipantChart';
import PendingProfilesTable from '../components/admin/PendingProfilesTable';
import PendingRequestsList from '../components/admin/PendingRequestsList';
import styles from './AdminDashboard.module.css';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: 'Tổng sự kiện', value: '12', trend: '+2', icon: '📅' },
    { label: 'Sự kiện đang diễn ra', value: '3', trend: '+1', icon: '🔴' },
    { label: 'Tổng đội', value: '245', trend: '+45', icon: '👥' },
    { label: 'Tổng tham gia', value: '1,230', trend: '+180', icon: '👨‍👩‍👧‍👦' },
  ];

  const currentEvent = {
    name: 'SEAL Hackathon Summer 2026',
    status: 'Live',
    round: 'Vòng Sơ khảo',
    roundProgress: 65,
    startDate: '2026-07-30',
    endDate: '2026-07-31',
    submissions: '45/50',
  };

  const chartData = [
    { event: 'Summer 2026', participants: 320 },
    { event: 'Spring 2026', participants: 280 },
    { event: 'Winter 2025', participants: 245 },
    { event: 'Fall 2025', participants: 210 },
    { event: 'Summer 2025', participants: 190 },
  ];

  const pendingProfiles = [
    { id: 1, name: 'Nguyễn Văn A', school: 'ĐH Bách Khoa HN', studentId: 'BK123456', date: '2026-06-15' },
    { id: 2, name: 'Trần Thị B', school: 'ĐH Kinh tế TP.HCM', studentId: 'KT789012', date: '2026-06-14' },
    { id: 3, name: 'Phạm Minh C', school: 'ĐH Công nghệ TP.HCM', studentId: 'CT345678', date: '2026-06-13' },
    { id: 4, name: 'Lê Hoàng D', school: 'ĐH Kinh tế Quốc dân', studentId: 'KD901234', date: '2026-06-12' },
  ];

  const pendingRequests = [
    { id: 1, type: 'Thay đổi thành viên', sender: 'Team Alpha', time: '30 phút trước', status: 'Chờ' },
    { id: 2, type: 'Thay đổi tên đội', sender: 'Team Beta', time: '1 giờ trước', status: 'Chờ' },
    { id: 3, type: 'Rút khỏi sự kiện', sender: 'Team Gamma', time: '2 giờ trước', status: 'Chờ' },
  ];

  // Inline admin layout instead of using separate layout component
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Navbar */}
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div className={styles.dashboardContainer}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className={styles.mainGrid}>
              {/* Left Column */}
              <div className={styles.leftColumn}>
                <EventStatusCard event={currentEvent} />
              </div>

              {/* Right Column */}
              <div className={styles.rightColumn}>
                <ParticipantChart data={chartData} />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className={styles.bottomGrid}>
              {/* Left: Pending Profiles */}
              <div className={styles.bottomLeft}>
                <PendingProfilesTable profiles={pendingProfiles} />
              </div>

              {/* Right: Pending Requests */}
              <div className={styles.bottomRight}>
                <PendingRequestsList requests={pendingRequests} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
