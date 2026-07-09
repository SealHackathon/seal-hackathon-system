import { useState, useMemo } from 'react'
import { UsersThree, MagnifyingGlass } from '@phosphor-icons/react'
import FormInput from '../../shared/FormInput'
import FilterTabs from '../../shared/SearchFilterBar/FilterTabs'
import SortBar from '../../shared/SearchFilterBar/SortBar'
import Badge from '../../shared/Badge'
import Pagination from '../../shared/Pagination'
import MentorTeamRow from './MentorTeamRow'
import styles from './MentorTeamTable.module.css'

const PAGE_SIZE = 5

// FilterTabs chỉ hỗ trợ dot green/blue/orange -> "Đã dừng bước" không gắn dot.
const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'competing', label: 'Đang thi đấu', dot: 'blue' },
  { key: 'attention', label: 'Cần chú ý', dot: 'orange' },
  { key: 'stopped', label: 'Đã dừng bước' },
]

const SORT_OPTIONS = [
  { key: 'name', label: 'Tên đội' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'score', label: 'Điểm số' },
]

// Filter "competing" gộp cả đội đang thi lẫn đội đã có kết quả tốt (lọt top).
function matchFilter(team, filter) {
  if (filter === 'all') return true
  if (filter === 'competing') return team.status === 'competing' || team.status === 'top'
  if (filter === 'attention') return team.status === 'attention'
  if (filter === 'stopped') return team.status === 'stopped'
  return true
}

/**
 * MentorTeamTable — bảng các đội mentor phụ trách.
 * Có tìm kiếm, lọc theo trạng thái, sắp xếp và phân trang.
 * Mỗi dòng tách ra component riêng MentorTeamRow.
 *
 * @param {Array}    teams           — danh sách đội
 * @param {function} onOpenRequests  — (team) => void, mở popup câu hỏi
 */
function MentorTeamTable({ teams = [], onOpenRequests }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('progress')
  const [page, setPage] = useState(1)

  // ── Đếm số đội cho từng filter ──
  const countByKey = useMemo(
    () => ({
      all: teams.length,
      competing: teams.filter((t) => matchFilter(t, 'competing')).length,
      attention: teams.filter((t) => matchFilter(t, 'attention')).length,
      stopped: teams.filter((t) => matchFilter(t, 'stopped')).length,
    }),
    [teams],
  )

  // ── Lọc + tìm kiếm + sắp xếp ──
  const visible = useMemo(() => {
    let list = teams.filter((t) => matchFilter(t, filter))

    const kw = search.trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(kw) ||
          t.leader.toLowerCase().includes(kw),
      )
    }

    list = [...list].sort((a, b) => {
      if (sort === 'progress') {
        return b.progress.done / b.progress.total - a.progress.done / a.progress.total
      }
      if (sort === 'score') {
        return (b.score ?? 0) - (a.score ?? 0)
      }
      return a.name.localeCompare(b.name, 'vi')
    })
    return list
  }, [teams, filter, search, sort])

  // ── Phân trang ──
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleFilter(key) {
    setFilter(key)
    setPage(1)
  }
  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>
          <UsersThree size={19} weight="fill" className={styles.titleIcon} />
          Đội phụ trách
        </span>
        <Badge variant="blueSolid" size="sm" dot={false} label={`${teams.length} đội`} />
      </div>

      {/* Toolbar: search bên trái, cột filter + sort bên phải */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <FormInput
            iconLeft={MagnifyingGlass}
            placeholder="Tìm theo tên đội hoặc trưởng nhóm..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterCol}>
          <FilterTabs
            filters={FILTERS}
            countByKey={countByKey}
            activeKey={filter}
            onChange={handleFilter}
          />
          <SortBar options={SORT_OPTIONS} activeKey={sort} onChange={setSort} />
        </div>
      </div>

      {/* Bảng */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Đội</th>
              <th>Thành viên</th>
              <th>Vòng &amp; tiến độ</th>
              <th>Bài nộp</th>
              <th>Kết quả gần nhất</th>
              <th>Câu hỏi chờ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((team) => (
              <MentorTeamRow key={team.id} team={team} onOpenRequests={onOpenRequests} />
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  Không tìm thấy đội phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pageWrap}>
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </section>
  )
}

export default MentorTeamTable