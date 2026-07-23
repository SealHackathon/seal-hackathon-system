import { useState } from 'react'
import AuditOverviewCards from '../../../../../components/coordinator/events/AuditOverviewCards'
import AuditLogSection from '../../../../../components/coordinator/events/AuditLogSection'
import { AUDIT_OVERVIEW, MOCK_API_RESPONSE_LOGS } from './auditMock'
import styles from './AuditTab.module.css'

function AuditTab() {
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)

  // Giả lập gọi API lấy data phân trang:
  const apiResponse = MOCK_API_RESPONSE_LOGS; // Thực tế sẽ phụ thuộc vào page, limit, filterType
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.pageTitle}>Lịch sử thao tác</h2>
        <p className={styles.pageDesc}>
          Xem lại toàn bộ lịch sử các thao tác của hệ thống, bao gồm chấm điểm, sửa điểm và cờ vi phạm.
        </p>
      </header>
      
      <AuditOverviewCards overview={AUDIT_OVERVIEW} filterType={filterType} onFilterChange={setFilterType} />
      <div className={styles.auditWrap}>
        <AuditLogSection 
          apiResponse={apiResponse} 
          filterType={filterType} 
          page={page} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  )
}

export default AuditTab
