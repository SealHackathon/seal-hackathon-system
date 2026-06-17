import React, { useState } from 'react';

// Inline component styles
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#1a3a52',
    color: '#fff',
    padding: '24px 16px',
    overflowY: 'auto',
    borderRight: '1px solid #e0e0e0',
  },
  sidebarLogo: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  createButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#ff8c42',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px',
    fontSize: '14px',
  },
  navSection: {
    marginBottom: '24px',
  },
  navTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#8ba1b8',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  navItem: {
    padding: '10px 12px',
    marginBottom: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    color: '#b0c4de',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  navbar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  navbarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  statTitle: {
    fontSize: '12px',
    color: '#7a8fa6',
    fontWeight: '500',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0d3a66',
    marginBottom: '8px',
  },
  statTrend: {
    fontSize: '12px',
    color: '#0d7a66',
    fontWeight: '500',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1a1a1a',
  },
  eventName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0d3a66',
    marginBottom: '8px',
  },
  eventRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeLive: {
    backgroundColor: '#ff8c4233',
    color: '#ff8c42',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0d7a66',
    borderRadius: '4px',
  },
  eventLabel: {
    fontSize: '12px',
    color: '#7a8fa6',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  chartPlaceholder: {
    height: '200px',
    backgroundColor: '#f5f7fa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '14px',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafbfc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadCell: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#7a8fa6',
    textTransform: 'uppercase',
    backgroundColor: '#fafbfc',
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    padding: '12px 24px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
  },
  nameCell: {
    fontWeight: '600',
    color: '#0d3a66',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  approveBtn: {
    padding: '6px 12px',
    backgroundColor: '#0d7a66',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    color: '#7a8fa6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  requestsList: {
    padding: '0',
  },
  requestItem: {
    padding: '16px 24px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestType: {
    fontWeight: '600',
    color: '#0d3a66',
    fontSize: '14px',
  },
  requestMeta: {
    fontSize: '12px',
    color: '#7a8fa6',
    marginTop: '4px',
  },
  badgeWaiting: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#ffd70033',
    color: '#d4a200',
  },
};

// Stat Card Component
const StatCard = ({ icon, label, value, trend }) => (
  <div style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statTitle}>{label}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statTrend}>{trend}</div>
  </div>
);

// Event Status Component
const EventStatusCard = ({ event }) => (
  <div style={styles.eventCard}>
    <div style={styles.cardTitle}>Sự kiện đang diễn ra</div>
    <div style={styles.eventName}>{event.name}</div>
    <div style={styles.eventRow}>
      <span style={styles.eventLabel}>Trạng thái</span>
      <span style={{ ...styles.badge, ...styles.badgeLive }}>{event.status}</span>
    </div>
    <div style={styles.eventRow}>
      <span style={styles.eventLabel}>{event.round}</span>
      <span style={styles.eventLabel}>{event.roundProgress}%</span>
    </div>
    <div style={styles.progressBar}>
      <div style={{ ...styles.progressFill, width: `${event.roundProgress}%` }}></div>
    </div>
    <div style={styles.eventRow}>
      <span style={styles.eventLabel}>Bắt đầu: {event.startDate}</span>
      <span style={styles.eventLabel}>Kết thúc: {event.endDate}</span>
    </div>
    <div style={styles.eventRow}>
      <span style={styles.eventLabel}>Bài nộp: {event.submissions}</span>
    </div>
  </div>
);

// Chart Component
const ParticipantChart = ({ data }) => (
  <div style={styles.chartCard}>
    <div style={styles.cardTitle}>Người tham gia theo sự kiện</div>
    <div style={styles.chartPlaceholder}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px' }}>📊 Biểu đồ cột</div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {data.map((d, i) => (
            <div key={i}>{d.event}: {d.participants}</div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Pending Profiles Table
const PendingProfilesTable = ({ profiles }) => (
  <div style={styles.tableCard}>
    <div style={styles.tableHeader}>
      <div style={styles.cardTitle}>Hồ sơ chờ duyệt</div>
    </div>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeadCell}>Họ tên</th>
          <th style={styles.tableHeadCell}>Trường</th>
          <th style={styles.tableHeadCell}>Mã sinh viên</th>
          <th style={styles.tableHeadCell}>Ngày nộp</th>
          <th style={styles.tableHeadCell}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((profile) => (
          <tr key={profile.id}>
            <td style={{ ...styles.tableCell, ...styles.nameCell }}>{profile.name}</td>
            <td style={styles.tableCell}>{profile.school}</td>
            <td style={styles.tableCell}>{profile.studentId}</td>
            <td style={styles.tableCell}>{profile.date}</td>
            <td style={styles.tableCell}>
              <div style={styles.actionButtons}>
                <button style={styles.approveBtn}>Duyệt</button>
                <button style={styles.rejectBtn}>Từ chối</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Pending Requests List
const PendingRequestsList = ({ requests }) => (
  <div style={styles.tableCard}>
    <div style={styles.tableHeader}>
      <div style={styles.cardTitle}>Yêu cầu chờ xử lý</div>
    </div>
    <div style={styles.requestsList}>
      {requests.map((request) => (
        <div key={request.id} style={styles.requestItem}>
          <div>
            <div style={styles.requestType}>{request.type}</div>
            <div style={styles.requestMeta}>{request.sender} • {request.time}</div>
          </div>
          <span style={styles.badgeWaiting}>{request.status}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: 'Tổng sự kiện', value: '12', trend: '+2 từ tháng trước', icon: '📅' },
    { label: 'Sự kiện đang diễn ra', value: '2', trend: 'Đang hoạt động', icon: '🔴' },
    { label: 'Tổng teams', value: '48', trend: '+8 tuần này', icon: '👥' },
    { label: 'Tổng người tham gia', value: '240', trend: '+32 tuần này', icon: '👤' },
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

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          🛡️ SEAL Hackathon
        </div>
        <button style={styles.createButton}>+ Tạo sự kiện</button>

        {/* Management Section */}
        <div style={styles.navSection}>
          <div style={styles.navTitle}>Quản lý</div>
          <div style={{ ...styles.navItem, backgroundColor: '#0d7a66', color: '#fff' }}>📅 Sự kiện</div>
          <div style={styles.navItem}>📋 Rubric</div>
          <div style={styles.navItem}>📢 Thông báo</div>
          <div style={styles.navItem}>👥 Người dùng</div>
          <div style={styles.navItem}>⏰ Lịch trình</div>
        </div>

        {/* Support Section */}
        <div style={styles.navSection}>
          <div style={styles.navTitle}>Hỗ trợ</div>
          <div style={styles.navItem}>⚙️ Xử lý yêu cầu</div>
          <div style={styles.navItem}>🔧 Cài đặt</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Navbar */}
        <div style={styles.navbar}>
          <div style={styles.navbarTitle}>Dashboard</div>
          <div style={{ fontSize: '14px', color: '#7a8fa6' }}>👤 Admin</div>
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Main Grid - Event Status & Chart */}
          <div style={styles.mainGrid}>
            <EventStatusCard event={currentEvent} />
            <ParticipantChart data={chartData} />
          </div>

          {/* Bottom Grid - Tables */}
          <div style={styles.bottomGrid}>
            <PendingProfilesTable profiles={pendingProfiles} />
            <PendingRequestsList requests={pendingRequests} />
          </div>
        </div>
      </div>
    </div>
  );
}
