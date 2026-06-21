import { useState, useMemo } from 'react'
import { MagnifyingGlass, Plus, ArrowUp, ArrowDown, Heart, Flag, Trash, Archive, FileX } from '@phosphor-icons/react'
import EventCard from '../components/coordinator/EventCard'
import Button from '../components/shared/Button'
import SectionHeader from '../components/shared/SectionHeader'
import SearchFilterBar from '../components/shared/SearchFilterBar/SearchFilterBar'
import styles from './EventListPage.module.css'

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'live', label: 'Đang diễn ra', dot: 'green' },
  { key: 'upcoming', label: 'Sắp diễn ra', dot: 'blue' },
  { key: 'ended', label: 'Đã diễn ra', dot: 'orange' },
  { key: 'draft', label: 'Lưu nháp', dotDashed: true },
  { key: 'cancelled', label: 'Đã hủy', icon: <Trash size={16} weight='fill' /> },
  { key: 'archived', label: 'Lưu trữ', icon: <Archive size={16} weight='fill' /> },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất', icon: <ArrowDown size={16} weight='fill' /> },
  { key: 'oldest', label: 'Cũ nhất', icon: <ArrowUp size={16} weight='fill' /> },
  { key: 'popular', label: 'Phổ biến nhất', icon: <Heart size={16} weight='fill' /> },
]


const MOCK_EVENTS = [
  // 1. LIVE — giữ nguyên
  {
    id: '1',
    status: 'live',
    title: 'SEAL Hackathon Summer 2026',
    theme: 'AI Agents for Software Innovation',
    thumbnail: null,
    teamSize: '3 - 5 người / đội',
    venues: ['Đại học FPT', 'Nhà Văn Hóa Sinh viên'],
    prize: '16.500.000 VNĐ',
    tags: ['AI', 'Software', 'Hackathon', 'FPT', 'Summer'],
    timeline: [
      { date: '08/06/2026', label: 'Mở cổng đăng kí' },
      { date: '19/06/2026', label: 'Đóng cổng đăng kí' },
      { date: '22/06/2026', label: 'Workshop Online' },
      { date: '30/06/2026', label: 'Vòng Sơ khảo' },
      { date: '31/06/2026', label: 'Vòng Chung kết' },
    ],
    teamCount: 42, participantCount: 168, categoryCount: 4, roundCount: 2,
  },

  // 2. UPCOMING — sắp diễn ra, chưa có đội nào đăng ký
  {
    id: '2',
    status: 'upcoming',
    title: 'FPT Innovation Challenge 2026',
    theme: 'Green Tech & Sustainable Future',
    thumbnail: null,
    teamSize: '2 - 4 người / đội',
    venues: ['Hội trường A FPT Hà Nội'],
    prize: '30.000.000 VNĐ',
    tags: ['GreenTech', 'Sustainability', 'IoT', 'Startup'],
    timeline: [],
    teamCount: 0, participantCount: 0, categoryCount: 6, roundCount: 3,
  },

  // 3. ENDED — đã kết thúc, nhiều đội tham gia
  {
    id: '3',
    status: 'ended',
    title: 'SEAL Hackathon Spring 2025',
    theme: 'FinTech Reimagined',
    thumbnail: null,
    teamSize: '3 - 6 người / đội',
    venues: ['Đại học FPT TP.HCM', 'Trực tuyến'],
    prize: '25.000.000 VNĐ',
    tags: ['FinTech', 'Blockchain', 'Mobile', 'API', 'Banking', 'Spring'],
    timeline: [],
    teamCount: 89, participantCount: 312, categoryCount: 5, roundCount: 4,
  },

  // 4. DRAFT — chưa công bố, dữ liệu còn sơ sài
  {
    id: '4',
    status: 'draft',
    title: 'SEAL x Google DevFest 2025',
    theme: 'Chưa xác định',
    thumbnail: null,
    teamSize: '2 - 5 người / đội',
    venues: ['Google Hà Nội Office'],
    prize: '50.000.000 VNĐ',
    tags: ['Google', 'Cloud', 'AI/ML'],
    timeline: [],
    teamCount: 0, participantCount: 0, categoryCount: 3, roundCount: 2,
  },

  // 5. CANCELLED — đã hủy giữa chừng
  {
    id: '5',
    status: 'cancelled',
    title: 'DataViz Cup 2025',
    theme: 'Storytelling with Data',
    thumbnail: null,
    teamSize: '1 - 3 người / đội',
    venues: ['Đại học Bách Khoa HCM'],
    prize: '8.000.000 VNĐ',
    tags: ['DataViz', 'Analytics', 'Design'],
    timeline: [],
    teamCount: 17, participantCount: 34, categoryCount: 2, roundCount: 2,
  },

  // 6. ARCHIVED — lưu trữ, sự kiện cũ
  {
    id: '6',
    status: 'ARCHIVED',
    title: 'SEAL Hackathon Pilot 2024',
    theme: 'Build Fast, Learn Faster',
    thumbnail: null,
    teamSize: '2 - 4 người / đội',
    venues: ['FPT Cần Thơ'],
    prize: '5.000.000 VNĐ',
    tags: ['Pilot', '2024', 'Web', 'Mobile'],
    timeline: [],
    teamCount: 20, participantCount: 67, categoryCount: 2, roundCount: 2,
  },
]

function EventListPage({ onCreateEvent, onManageEvent }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = MOCK_EVENTS
    if (activeFilter !== 'all') list = list.filter(e => e.status === activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.theme.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeFilter, searchQuery])

  // count per status for badge
  const countByStatus = useMemo(() => {
    const map = { all: MOCK_EVENTS.length }
    MOCK_EVENTS.forEach(e => { map[e.status] = (map[e.status] ?? 0) + 1 })
    return map
  }, [])

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.topRow}>
        <SectionHeader
          icon={Flag}
          title="Quản lí toàn bộ sự kiện"
          level="h1"
        />
        <Button
          label="Tạo sự kiện"
          variant="primary"
          color="green"
          icon={Plus}
          onClick={onCreateEvent}
        />
      </div>


      {/* Search */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm kiếm tên sự kiện"
        filters={STATUS_FILTERS}
        countByKey={countByStatus}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOptions={SORT_OPTIONS}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        sortLabel="Sắp xếp theo"
      />


      {/* Event cards */}
      <div className={styles.cardList}>
        {filtered.length === 0
          ? <p className={styles.empty}>Không có sự kiện nào.</p>
          : filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onManage={() => onManageEvent?.(event.id)}
              onView={() => console.log('view', event.id)}
              onCopyLink={() => navigator.clipboard?.writeText(window.location.href)}
              onExport={() => console.log('export', event.id)}
              onDuplicate={() => console.log('duplicate', event.id)}
              onArchive={() => console.log('archive', event.id)}
              onCancel={() => console.log('cancel', event.id)}
              onDelete={() => console.log('delete', event.id)}
            />
          ))
        }
      </div>
    </div>
  )
}

export default EventListPage
