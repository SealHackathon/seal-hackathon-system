import { useState, useMemo, Fragment } from 'react'
import { ClipboardText, MagnifyingGlass } from '@phosphor-icons/react'
import FormInput from '../../../shared/FormInput'
import FilterTabs from '../../../shared/SearchFilterBar/FilterTabs'
import SortBar from '../../../shared/SearchFilterBar/SortBar'
import Badge from '../../../shared/Badge'
import JudgeSubmissionRow from './JudgeSubmissionRow'
import styles from './JudgeSubmissionTable.module.css'

// FilterTabs chỉ hỗ trợ dot green/blue/orange -> "Chưa chấm" không gắn dot.
const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unscored', label: 'Chưa chấm' },
  { key: 'draft', label: 'Đã lưu nháp', dot: 'orange' },
  { key: 'done', label: 'Đã chấm xong', dot: 'green' },
]

const SORT_OPTIONS = [
  { key: 'submittedAt', label: 'Nộp gần nhất' },
  { key: 'name', label: 'Tên đội' },
  { key: 'score', label: 'Điểm số' },
]

function matchFilter(s, filter) {
  if (filter === 'all') return true
  return s.status === filter
}

/**
 * JudgeSubmissionTable — bảng bài nộp cần chấm của một vòng.
 * Có tìm kiếm, lọc theo trạng thái chấm, sắp xếp; nhóm theo hạng mục.
 * Mỗi dòng tách ra component riêng JudgeSubmissionRow.
 *
 * @param {Array}    submissions
 * @param {function} [onScore]  — (submission) => void
 */
function JudgeSubmissionTable({ submissions = [], onScore }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('submittedAt')

  // ── Đếm số đội cho từng filter ──
  const countByKey = useMemo(
    () => ({
      all: submissions.length,
      unscored: submissions.filter((s) => s.status === 'unscored').length,
      draft: submissions.filter((s) => s.status === 'draft').length,
      done: submissions.filter((s) => s.status === 'done').length,
    }),
    [submissions],
  )

  // ── Lọc + tìm kiếm + sắp xếp ──
  const visible = useMemo(() => {
    let list = submissions.filter((s) => matchFilter(s, filter))

    const kw = search.trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (s) =>
          s.teamName.toLowerCase().includes(kw) ||
          (s.leader ?? '').toLowerCase().includes(kw),
      )
    }

    list = [...list].sort((a, b) => {
      if (sort === 'score') return (b.score ?? -1) - (a.score ?? -1)
      if (sort === 'name') return a.teamName.localeCompare(b.teamName, 'vi')
      return new Date(b.submittedAt) - new Date(a.submittedAt)
    })
    return list
  }, [submissions, filter, search, sort])

  // ── Nhóm theo hạng mục (giữ thứ tự xuất hiện) ──
  const groups = useMemo(() => {
    const map = new Map()
    visible.forEach((s) => {
      const key = s.category ?? 'Khác'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    })
    return Array.from(map, ([category, items]) => ({ category, items }))
  }, [visible])

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>
          <ClipboardText size={19} weight="fill" className={styles.titleIcon} />
          Danh sách đội cần chấm
        </span>
        <Badge variant="blueSolid" size="sm" dot={false} label={`${submissions.length} đội có bài nộp`} />
      </div>

      {/* Toolbar: search + filter + sort cùng một hàng */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <FormInput
            iconLeft={MagnifyingGlass}
            placeholder="Tìm đội thi theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterCol}>
          <FilterTabs filters={FILTERS} countByKey={countByKey} activeKey={filter} onChange={setFilter} />
          <SortBar options={SORT_OPTIONS} activeKey={sort} onChange={setSort} />
        </div>
      </div>

      {/* Bảng nhóm theo hạng mục */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Đội thi</th>
              <th>Nộp bài lúc</th>
              <th>Bài nộp</th>
              <th>Điểm đã chấm</th>
              <th>Trạng thái chấm</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.category}>
                <tr className={styles.groupRow}>
                  <td colSpan={6}>
                    <span className={styles.groupName}>{g.category}</span>
                    <span className={styles.groupCount}>{g.items.length} đội</span>
                  </td>
                </tr>
                {g.items.map((s) => (
                  <JudgeSubmissionRow key={s.id} submission={s} onScore={onScore} />
                ))}
              </Fragment>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  Không tìm thấy đội phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default JudgeSubmissionTable
