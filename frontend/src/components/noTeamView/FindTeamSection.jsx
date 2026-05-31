import { useState } from 'react'
import TeamCard from './TeamCard'
import CardSearchBase from '../shared/CardSearchBase'
import styles from '../leaderView/FindMemberModal.module.css'

const FAKE_TEAMS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: 'Tên đội',
  description: 'Giới thiệu ngắn về đội của bạn và định hướng giải quyết bài toán.',
  maxSlots: 4,
  members: [
    { id: 10, name: 'Nguyễn Thành Thái', school: 'Đại học FPT' },
    { id: 11, name: 'Hồ Ngọc Bảo Trân',  school: 'Đại học FPT' },
  ],
  isRequested: false,
}))

function FindTeamSection() {
  const [search, setSearch] = useState('')
  const [fptOnly, setFptOnly] = useState(false)
  const [requestedIds, setRequestedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const teams = FAKE_TEAMS.map(t => ({
    ...t,
    isRequested: requestedIds.includes(t.id),
  }))

  return (
    <div className={styles.modal}>
      <CardSearchBase
        items={teams}
        renderCard={(team) => (
          <TeamCard
            key={team.id}
            team={team}
            onRequest={(id) => setRequestedIds(prev => [...prev, id])}
            onCancel={(id) => setRequestedIds(prev => prev.filter(i => i !== id))}
          />
        )}
        searchPlaceholder="Tìm kiếm tên đội"
        search={search}
        onSearchChange={setSearch}
        fptOnly={fptOnly}
        onFptChange={setFptOnly}
        currentPage={currentPage}
        totalPages={8}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default FindTeamSection