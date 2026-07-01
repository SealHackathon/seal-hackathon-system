import { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlass, Plus, ArrowUp, ArrowDown, Heart, Flag, Trash, Archive, FileX } from '@phosphor-icons/react'
import EventCard from '../components/coordinator/EventCard'
import Button from '../components/shared/Button'
import SectionHeader from '../components/shared/SectionHeader'
import SearchFilterBar from '../components/shared/SearchFilterBar/SearchFilterBar'
import EmptyEventState from '../components/coordinator/events/EmptyEventState'
import CoordinatorLayout from '../layouts/CoordinatorLayout'
import styles from './EventListPage.module.css'
import axiosClient from '../api/axiosClient'
import { useNavigate } from 'react-router-dom'
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


// const MOCK_EVENTS = [
//   // 1. LIVE — giữ nguyên
//   {
//     id: '1',
//     status: 'live',
//     title: 'SEAL Hackathon Summer 2026',
//     theme: 'AI Agents for Software Innovation',
//     thumbnail: null,
//     teamSize: '3 - 5 người / đội',
//     venues: ['Đại học FPT', 'Nhà Văn Hóa Sinh viên'],
//     prize: '16.500.000 VNĐ',
//     tags: ['AI', 'Software', 'Hackathon', 'FPT', 'Summer'],
//     timeline: [
//       { date: '08/06/2026', label: 'Mở cổng đăng kí' },
//       { date: '19/06/2026', label: 'Đóng cổng đăng kí' },
//       { date: '22/06/2026', label: 'Workshop Online' },
//       { date: '30/06/2026', label: 'Vòng Sơ khảo' },
//       { date: '31/06/2026', label: 'Vòng Chung kết' },
//     ],
//     teamCount: 42, participantCount: 168, categoryCount: 4, roundCount: 2,
//   },
//
//   // 2. UPCOMING — sắp diễn ra, chưa có đội nào đăng ký
//   {
//     id: '2',
//     status: 'upcoming',
//     title: 'FPT Innovation Challenge 2026',
//     theme: 'Green Tech & Sustainable Future',
//     thumbnail: null,
//     teamSize: '2 - 4 người / đội',
//     venues: ['Hội trường A FPT Hà Nội'],
//     prize: '30.000.000 VNĐ',
//     tags: ['GreenTech', 'Sustainability', 'IoT', 'Startup'],
//     timeline: [],
//     teamCount: 0, participantCount: 0, categoryCount: 6, roundCount: 3,
//   },
//
//   // 3. ENDED — đã kết thúc, nhiều đội tham gia
//   {
//     id: '3',
//     status: 'ended',
//     title: 'SEAL Hackathon Spring 2025',
//     theme: 'FinTech Reimagined',
//     thumbnail: null,
//     teamSize: '3 - 6 người / đội',
//     venues: ['Đại học FPT TP.HCM', 'Trực tuyến'],
//     prize: '25.000.000 VNĐ',
//     tags: ['FinTech', 'Blockchain', 'Mobile', 'API', 'Banking', 'Spring'],
//     timeline: [],
//     teamCount: 89, participantCount: 312, categoryCount: 5, roundCount: 4,
//   },
//
//   // 4. DRAFT — chưa công bố, dữ liệu còn sơ sài
//   {
//     id: '4',
//     status: 'draft',
//     title: 'SEAL x Google DevFest 2025',
//     theme: 'Chưa xác định',
//     thumbnail: null,
//     teamSize: '2 - 5 người / đội',
//     venues: ['Google Hà Nội Office'],
//     prize: '50.000.000 VNĐ',
//     tags: ['Google', 'Cloud', 'AI/ML'],
//     timeline: [],
//     teamCount: 0, participantCount: 0, categoryCount: 3, roundCount: 2,
//   },
//
//   // 5. CANCELLED — đã hủy giữa chừng
//   {
//     id: '5',
//     status: 'cancelled',
//     title: 'DataViz Cup 2025',
//     theme: 'Storytelling with Data',
//     thumbnail: null,
//     teamSize: '1 - 3 người / đội',
//     venues: ['Đại học Bách Khoa HCM'],
//     prize: '8.000.000 VNĐ',
//     tags: ['DataViz', 'Analytics', 'Design'],
//     timeline: [],
//     teamCount: 17, participantCount: 34, categoryCount: 2, roundCount: 2,
//   },
//
//   // 6. ARCHIVED — lưu trữ, sự kiện cũ
//   {
//     id: '6',
//     status: 'ARCHIVED',
//     title: 'SEAL Hackathon Pilot 2024',
//     theme: 'Build Fast, Learn Faster',
//     thumbnail: null,
//     teamSize: '2 - 4 người / đội',
//     venues: ['FPT Cần Thơ'],
//     prize: '5.000.000 VNĐ',
//     tags: ['Pilot', '2024', 'Web', 'Mobile'],
//     timeline: [],
//     teamCount: 20, participantCount: 67, categoryCount: 2, roundCount: 2,
//   },
// ]

function EventListPage({ onManageEvent }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')
  const navigate = useNavigate();
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // const filtered = useMemo(() => {
  //   let list = MOCK_EVENTS
  //   if (activeFilter !== 'all') list = list.filter(e => e.status === activeFilter)
  //   if (searchQuery.trim()) {
  //     const q = searchQuery.toLowerCase()
  //     list = list.filter(e =>
  //       e.title.toLowerCase().includes(q) ||
  //       e.theme.toLowerCase().includes(q)
  //     )
  //   }
  //   return list
  // }, [activeFilter, searchQuery])



  // count per status for badge
  // const countByStatus = useMemo(() => {
  //   const map = { all: MOCK_EVENTS.length }
  //   MOCK_EVENTS.forEach(e => { map[e.status] = (map[e.status] ?? 0) + 1 })
  //   return map
  // }, [])

  // 2. useEffect gọi API lấy danh sách sự kiện khi load trang
  // ── THÊM ĐOẠN USEEFFECT NÀY VÀO ──
  useEffect(() => {
    let isMounted = true;

    axiosClient.get('/event/all') // Gọi API lấy danh sách sự kiện
      .then(response => {
        if (isMounted && response.data) {

          // Khớp cấu trúc dữ liệu từ Backend DTO sang cấu trúc Card yêu cầu
          const formattedEvents = response.data.map(apiEvent => {

            // Tự động bóc tách mảng milestones thành timeline trên Card
            const timeline = (apiEvent.milestones || []).map(m => {
              const dateObj = new Date(m.dateStart);
              const formattedDate = isNaN(dateObj.getTime())
                ? 'Chưa rõ'
                : `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

              return {
                date: formattedDate,
                label: m.milestoneName
              };
            });




            return {
              id: apiEvent.eventId,
              status: (apiEvent.eventStatus || 'draft').toLowerCase(),
              title: apiEvent.eventName || 'Sự kiện chưa đặt tên',
              theme: apiEvent.eventTopic || 'Chưa xác định chủ đề',
              thumbnail: apiEvent.thumbnail,
              teamSize: `Tối đa ${apiEvent.maxTeamMember || 5} người / đội`,
              venues: [apiEvent.eventLocation || 'Trực tuyến'],
              prize: apiEvent.prize ? `${apiEvent.prize.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật',
              tags: apiEvent.eventTopic ? [apiEvent.eventTopic] : [],
              timeline: timeline,
              teamCount: apiEvent.teamQuantity || 0,
              participantCount: apiEvent.candidateQuantity || 0,
              categoryCount: apiEvent.trackQuantity || 0,
              roundCount: apiEvent.roundQuantity || 0,
              description: apiEvent.description || ''
            };
          });

          setEvents(formattedEvents);
        }
      })
      .catch(error => {
        console.error("Lỗi khi tải danh sách sự kiện:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);


  const handleOnDelete = (id) => {
    axiosClient.delete(`/event/${id}`).then(
      () => {
        console.log('delete event sucess !');
      }
    ).catch((error) => {
      console.log(error)
    })
  }

  const handleNavigation = (id) => {
        if (id === 'events') navigate('/admin/coordinator/events');
        if (id === 'rubric') navigate('/admin/coordinator/rubrics');
    };


  // ── SỬA CHỖ NÀY: Đổi MOCK_EVENTS thành biến events trong useMemo lọc ──
  const filtered = useMemo(() => {
    let list = events // Đổi từ MOCK_EVENTS sang events ở đây
    if (activeFilter !== 'all') list = list.filter(e => e.status === activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.theme.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeFilter, searchQuery, events]) // Thêm cả events vào mảng dependency này luôn


  // ── SỬA CHỖ NÀY: Đổi MOCK_EVENTS thành events trong useMemo đếm số lượng Badge ──
  const countByStatus = useMemo(() => {
    const map = { all: events.length } // Sửa thành events.length
    events.forEach(e => { map[e.status] = (map[e.status] ?? 0) + 1 }) // Sửa thành events.forEach
    return map
  }, [events]) // Đổi sang dependency là [events]

  return (
    <CoordinatorLayout onNavigate={ handleNavigation }>

    
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
          onClick={() => navigate('/admin/coordinator/events/create')}
        />
      </div>


      <div className={styles.pageContainer}>
        <div className={styles.maxWidthWrapper}>
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
              ? <EmptyEventState searchQuery={searchQuery} activeFilter={activeFilter} />
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
              onDelete={()=>{handleOnDelete(event.id)}}
            />
          ))
        }
          </div>
        </div>
      </div>
    </div>
    </CoordinatorLayout>
  )
}

export default EventListPage
