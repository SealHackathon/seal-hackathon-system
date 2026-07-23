import { useState } from 'react'
import AuditOverviewCards from '../../../../../components/coordinator/events/AuditOverviewCards'
import AuditLogSection from '../../../../../components/coordinator/events/AuditLogSection'
import { AUDIT_OVERVIEW, AUDIT_LOGS } from './auditMock'
import styles from './AuditTab.module.css'

function AuditTab() {
  const [filterType, setFilterType] = useState('all')
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
        <AuditLogSection logs={AUDIT_LOGS} filterType={filterType} />
      </div>
    </div>
  )
}

export default AuditTab
