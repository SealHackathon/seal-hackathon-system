import { useState } from 'react'
import { CheckCircle, NotePencil, Flag, ClockCounterClockwise, DownloadSimple, Clock, MagnifyingGlass } from '@phosphor-icons/react'
import Dropdown from '../../shared/Dropdown'
import Button from '../../shared/Button'
import FormInput from '../../shared/FormInput'
import Pagination from '../../shared/Pagination'
import { format } from 'date-fns' // formatting ISO date
import styles from './AuditLogSection.module.css'

/**
 * AuditLogSection — Hiển thị danh sách log
 */
function AuditLogSection({ apiResponse, filterType = 'all', page, onPageChange }) {
  const getIcon = (type) => {
    switch(type) {
      case 'score_submitted': return <CheckCircle size={22} weight="fill" className={styles.iconGreen} />
      case 'score_edited': return <NotePencil size={22} weight="fill" className={styles.iconBlue} />
      case 'flagged': return <Flag size={22} weight="fill" className={styles.iconOrange} />
      default: return <ClockCounterClockwise size={22} weight="fill" className={styles.iconMuted} />
    }
  }

  const getActionLabel = (type) => {
    switch(type) {
      case 'score_submitted': return <span className={`${styles.actionChip} ${styles.chipGreen}`}>ĐÃ CHẤM</span>
      case 'score_edited': return <span className={`${styles.actionChip} ${styles.chipBlue}`}>SỬA ĐIỂM</span>
      case 'flagged': return <span className={`${styles.actionChip} ${styles.chipOrange}`}>CẮM CỜ</span>
      default: return <span className={`${styles.actionChip} ${styles.chipGray}`}>THÔNG TIN</span>
    }
  }

  const [searchTerm, setSearchTerm] = useState('')

  const logs = apiResponse?.data || []
  const meta = apiResponse?.meta || { totalPages: 1 }

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      return (
        (log.user && log.user.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.target && log.target.toLowerCase().includes(q)) ||
        (log.detail && log.detail.toLowerCase().includes(q))
      )
    }
    return true
  })

  const exportCSV = () => {
    const headers = ['Thời gian', 'Loại thao tác', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Chi tiết']
    const rows = filteredLogs.map(log => [
      log.time, 
      log.type.toUpperCase(), 
      log.user, 
      log.action, 
      log.target, 
      log.detail || ''
    ])
    
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit_log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Lịch sử thao tác</h3>
        
        <div className={styles.headerRight}>
          <FormInput
            iconLeft={MagnifyingGlass}
            iconSize={16}
            iconWeight="bold"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ height: '100%', minWidth: '200px', flex: 2 }}
          />
          
          <Button 
            label="Xuất Log" 
            variant="outline" 
            color="blue" 
            icon={DownloadSimple} 
            iconSize={18}
            labelSize="0.85rem"
            onClick={exportCSV} 
          />
        </div>
      </div>

      <div className={styles.list} data-lenis-prevent>
        {filteredLogs.map(log => (
          <div key={log.id} className={styles.item}>
            
            <div className={styles.timeWrap}>
              <Clock size={16} weight="bold" className={styles.clockIcon} />
              <span className={styles.timeText}>
                {/* Format chuỗi ISO8601 cho nó khớp */}
                {log.time ? format(new Date(log.time), 'HH:mm dd/MM/yyyy') : ''}
              </span>
            </div>

            <div className={styles.chipWrap}>
              {getActionLabel(log.type)}
            </div>

            <div className={styles.contentWrap}>
              <div className={styles.iconWrap}>
                {getIcon(log.type)}
              </div>
              <div className={styles.content}>
                <div className={styles.mainText}>
                  <strong>{log.user}</strong> {log.action} cho <strong>{log.target}</strong>
                </div>
                {log.detail && (
                  <div className={styles.detailBox}>
                    <span className={styles.detailLabel}>Chi tiết:</span> {log.detail}
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className={styles.emptyText}>Không tìm thấy thao tác nào phù hợp.</div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <Pagination 
            currentPage={page} 
            totalPages={meta.totalPages} 
            onPageChange={onPageChange} 
          />
        </div>
      )}
    </div>
  )
}

export default AuditLogSection
