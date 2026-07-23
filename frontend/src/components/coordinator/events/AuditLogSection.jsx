import { useState } from 'react'
import { CheckCircle, NotePencil, Flag, ClockCounterClockwise, DownloadSimple, Clock, MagnifyingGlass } from '@phosphor-icons/react'
import Button from '../../shared/Button'
import FormInput from '../../shared/FormInput'
import Pagination from '../../shared/Pagination'
import { format } from 'date-fns'
import styles from './AuditLogSection.module.css'

/**
 * AuditLogSection — Hiển thị danh sách log, tự động lọc và phân trang ở Client
 */
function AuditLogSection({ apiResponse, filterType = 'all', page, onPageChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const ITEMS_PER_PAGE = 5 // Số lượng log hiển thị trên 1 trang

  // Helper lấy icon theo loại thao tác
  const getIcon = (type) => {
    switch (type) {
      case 'score_submitted':
        return <CheckCircle size={22} weight="fill" className={styles.iconGreen} />
      case 'score_edited':
        return <NotePencil size={22} weight="fill" className={styles.iconBlue} />
      case 'flagged':
        return <Flag size={22} weight="fill" className={styles.iconOrange} />
      default:
        return <ClockCounterClockwise size={22} weight="fill" className={styles.iconMuted} />
    }
  }

  // Helper lấy nhãn hiển thị chip
  const getActionLabel = (type) => {
    switch (type) {
      case 'score_submitted':
        return <span className={`${styles.actionChip} ${styles.chipGreen}`}>ĐÃ CHẤM</span>
      case 'score_edited':
        return <span className={`${styles.actionChip} ${styles.chipBlue}`}>SỬA ĐIỂM</span>
      case 'flagged':
        return <span className={`${styles.actionChip} ${styles.chipOrange}`}>CẮM CỜ</span>
      default:
        return <span className={`${styles.actionChip} ${styles.chipGray}`}>THÔNG TIN</span>
    }
  }

  const allLogs = apiResponse?.data || []

  // 1. TỰ LỌC DỮ LIỆU CẢ THEO TAB (filterType) VÀ TỪ KHÓA TÌM KIẾM (searchTerm)
  const filteredLogs = allLogs.filter((log) => {
    // Lọc theo Tab bộ lọc
    if (filterType !== 'all' && log.type !== filterType) {
      return false
    }

    // Lọc theo ô tìm kiếm
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

  // 2. TỰ TÍNH TOÁN PHÂN TRANG Ở FRONTEND
  const totalRecords = filteredLogs.length
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1
  
  // Cắt mảng lấy đúng 5 phần tử cho trang hiện tại
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Hàm xuất file CSV
  const exportCSV = () => {
    const headers = ['Thời gian', 'Loại thao tác', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Chi tiết']
    const rows = filteredLogs.map((log) => [
      log.time,
      log.type ? log.type.toUpperCase() : '',
      log.user,
      log.action,
      log.target,
      log.detail || '',
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_log_${filterType}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      {/* Header & Thanh tìm kiếm / Xuất CSV */}
      <div className={styles.header}>
        <h3 className={styles.title}>Lịch sử thao tác</h3>

        <div className={styles.headerRight}>
          <FormInput
            iconLeft={MagnifyingGlass}
            iconSize={16}
            iconWeight="bold"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              onPageChange(1) // Reset về trang 1 khi tìm kiếm
            }}
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

      {/* Danh sách Logs */}
      <div className={styles.list} data-lenis-prevent>
        {paginatedLogs.map((log) => (
          <div key={log.id} className={styles.item}>
            {/* Cột Thời gian */}
            <div className={styles.timeWrap}>
              <Clock size={16} weight="bold" className={styles.clockIcon} />
              <span className={styles.timeText}>
                {log.time ? format(new Date(log.time), 'HH:mm dd/MM/yyyy') : ''}
              </span>
            </div>

            {/* Chip Nhãn loại thao tác */}
            <div className={styles.chipWrap}>{getActionLabel(log.type)}</div>

            {/* Nội dung chi tiết log */}
            <div className={styles.contentWrap}>
              <div className={styles.iconWrap}>{getIcon(log.type)}</div>
              <div className={styles.content}>
                <div className={styles.mainText}>
                  <strong>{log.user}</strong> {log.action} <strong>{log.target}</strong>
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

        {paginatedLogs.length === 0 && (
          <div className={styles.emptyText}>Không tìm thấy thao tác nào phù hợp.</div>
        )}
      </div>

      {/* Thanh Phân Trang */}
      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

export default AuditLogSection