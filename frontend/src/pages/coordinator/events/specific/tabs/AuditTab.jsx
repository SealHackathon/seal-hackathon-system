import { useState, useEffect } from 'react'
import AuditOverviewCards from '../../../../../components/coordinator/events/AuditOverviewCards'
import AuditLogSection from '../../../../../components/coordinator/events/AuditLogSection'
import styles from './AuditTab.module.css'
import axiosClient from '../../../../../api/axiosClient'
function AuditTab() {
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  
  // State lưu trữ dữ liệu từ API
  const [overview, setOverview] = useState({
    totalActions: 0,
    scoreSubmissions: 0,
    scoreEdits: 0,
    violationsFlagged: 0
  })
  
  const [apiResponse, setApiResponse] = useState({
    meta: {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 20
    },
    data: []
  })

  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)

  // 1. Fetch dữ liệu Thống kê Overview
  useEffect(() => {
    setLoadingOverview(true)
    axiosClient.get('/audit-logs/overview')
      .then((res) => {
        setOverview(res.data)
      })
      .catch((err) => {
        console.error("Lỗi khi tải thông tin tổng quan audit log:", err)
      })
      .finally(() => {
        setLoadingOverview(false)
      })
  }, [])

  // 2. Fetch danh sách Audit Logs (chạy lại mỗi khi page hoặc filterType thay đổi)
  useEffect(() => {
    setLoadingLogs(true)
    
    // Khởi tạo query params
    const params = {
      page: page,
      limit: 5
    }

    // Nếu có filter thì truyền kèm vào param
    if (filterType !== 'all') {
      params.type = filterType
    }

    axiosClient.get('/audit-logs', { params })
      .then((res) => {
        setApiResponse(res.data)
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách nhật ký thao tác:", err)
      })
      .finally(() => {
        setLoadingLogs(false)
      })
  }, [page, filterType])

  // Reset về trang 1 khi chuyển bộ lọc filter
  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter)
    setPage(1)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.pageTitle}>Lịch sử thao tác</h2>
        <p className={styles.pageDesc}>
          Xem lại toàn bộ lịch sử các thao tác của hệ thống, bao gồm chấm điểm, sửa điểm và cờ vi phạm.
        </p>
      </header>
      
      {/* Cards thống kê */}
      <AuditOverviewCards 
        overview={overview} 
        filterType={filterType} 
        onFilterChange={handleFilterChange} 
        loading={loadingOverview}
      />

      {/* Danh sách logs & Phân trang */}
      <div className={styles.auditWrap}>
        <AuditLogSection 
          apiResponse={apiResponse} 
          filterType={filterType} 
          page={page} 
          onPageChange={setPage} 
          loading={loadingLogs}
        />
      </div>
    </div>
  )
}

export default AuditTab