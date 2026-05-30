import { useState } from 'react'
import { X, MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react'
import MemberCard from './MemberCard'
import styles from './FindMemberModal.module.css'

const FAKE_MEMBERS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: 'Nguyễn Thành Thái',
  email: 'ntbi533@gmail.com',
  school: 'Đại học FPT',
  bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.',
  isInvited: false,
}))

const TOTAL_PAGES = 8

function FindMemberModal({ onClose }) {
  const [search, setSearch] = useState('')
  const [fptOnly, setFptOnly] = useState(false)
  const [invitedIds, setInvitedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  function handleInvite(id) {
    setInvitedIds(prev => [...prev, id])
  }

  function handleCancel(id) {
    setInvitedIds(prev => prev.filter(i => i !== id))
  }

  const members = FAKE_MEMBERS.map(m => ({
    ...m,
    isInvited: invitedIds.includes(m.id),
  }))

  // Tạo mảng trang hiển thị trong pagination
  function getPageNumbers() {
    if (TOTAL_PAGES <= 5) return Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1)
    const pages = [1, 2, 3]
    const showDots = currentPage < TOTAL_PAGES - 2
    return { pages, showDots }
  }

  const { pages, showDots } = getPageNumbers()

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Nút đóng */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} color="var(--color-text-secondary)" />
        </button>

        {/* Tiêu đề */}
        <h2 className={styles.title}>Tìm thành viên</h2>
        <p className={styles.subtitle}>
          Tìm và mời thành viên vào đội của bạn. Lời mời sẽ được gửi đến và người nhận có thể chấp nhận hoặc từ chối.
        </p>

        {/* Thanh tìm kiếm */}
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="Tìm theo tên hoặc email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={20} color="var(--color-primary-blue)" />
        </div>

        {/* Filter */}
        <label className={styles.filter}>
          <span>Lọc theo</span>
          <input
            type="checkbox"
            checked={fptOnly}
            onChange={(e) => setFptOnly(e.target.checked)}
          />
          <span>Sinh viên Đại học FPT HCMC</span>
        </label>

        {/* Grid card */}
        <div className={styles.grid}>
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onInvite={handleInvite}
              onCancel={handleCancel}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>

          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <CaretLeft/> Trước
          </button>

          {pages.map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}

          {showDots && <span className={styles.dots}>...</span>}

          <button
            className={`${styles.pageBtn} ${currentPage === TOTAL_PAGES ? styles.active : ''}`}
            onClick={() => setCurrentPage(TOTAL_PAGES)}
          >
            {TOTAL_PAGES}
          </button>

          <button
            className={styles.pageBtn}
            disabled={currentPage === TOTAL_PAGES}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Tiếp <CaretRight/>
          </button>

        </div>
      </div>
    </div>
  )
}

export default FindMemberModal