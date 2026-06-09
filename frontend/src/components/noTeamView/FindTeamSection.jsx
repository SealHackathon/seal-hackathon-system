import { useState } from 'react'
import TeamCard from './TeamCard'
import CardSearchBase from '../shared/CardSearchBase'
// import styles from '../leaderView/FindMemberModal.module.css'
import styles from '../shared/CardSearchBase.module.css'

const PAGE_SIZE = 6 // * số cards mỗi trang

function FindTeamSection({ teams = [] }) {
  const [search, setSearch] = useState('')
  const [fptOnly, setFptOnly] = useState(false)
  const [requestedIds, setRequestedIds] = useState([]) // lưu requestId của những đội đã gửi request tham gia
  const [currentPage, setCurrentPage] = useState(1)


  const processedTeams = teams.map(t => ({
    ...t,
    isRequested: requestedIds.includes(t.id),
    // * tạo ra một object mới copy từ team cũ (...t) rồi thêm/ghi đè field isRequested
  }))

  // * filter từ cái processedTeams
  const filtered = processedTeams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase())
    // * tìm kiếm theo search, search thay đổi mỗi khi nhập một giá trị mới vào ô tìm kiếm
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )



  return (
    <div className={`${styles.wrapper} ${styles.card}`}>
      <CardSearchBase
        items={paged}
        renderCard={(team) => (
          <TeamCard
            key={team.id}
            team={team}
            onRequest={(id) => setRequestedIds(prev => [...prev, id])} // thêm id vào danh sách đã request
            onCancel={(id) => setRequestedIds(prev => prev.filter(i => i !== id))} // xóa id khỏi danh sách đã request
          />
        )}
        searchPlaceholder="Tìm kiếm tên đội"
        search={search}
        onSearchChange={setSearch}
        fptOnly={fptOnly}
        onFptChange={setFptOnly}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default FindTeamSection