import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import MemberCard from './MemberCard'
import CardSearchBase from '../shared/CardSearchBase'
import styles from '../shared/CardSearchBase.module.css'

const FAKE_MEMBERS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: 'Nguyễn Thành Thái',
  email: 'ntbi533@gmail.com',
  school: 'Đại học FPT',
  bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot.',
  isInvited: false,
}))

function FindMemberModal({ onClose }) {
  const [search, setSearch] = useState('')
  const [fptOnly, setFptOnly] = useState(false)
  const [invitedIds, setInvitedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const members = FAKE_MEMBERS.map(m => ({
    ...m,
    isInvited: invitedIds.includes(m.id),
  }))

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.wrapper} ${styles.modalScroll}`} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} color="var(--color-text-secondary)" />
        </button>

        <h1 className={styles.title}>Tìm thành viên</h1>
        <p className={styles.subtitle}>
          Tìm và mời thành viên vào đội của bạn. Lời mời sẽ được gửi đến và người nhận có thể chấp nhận hoặc từ chối.
        </p>

        <CardSearchBase
          items={members}
          renderCard={(member) => (
            <MemberCard
              key={member.id}
              member={member}
              onInvite={(id) => setInvitedIds(prev => [...prev, id])}
              onCancel={(id) => setInvitedIds(prev => prev.filter(i => i !== id))}
            />
          )}
          searchPlaceholder="Tìm theo tên hoặc email"
          search={search}
          onSearchChange={setSearch}
          fptOnly={fptOnly}
          onFptChange={setFptOnly}
          currentPage={currentPage}
          totalPages={8}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  )
}

export default FindMemberModal