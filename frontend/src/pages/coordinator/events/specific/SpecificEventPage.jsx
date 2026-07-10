import { useParams, useNavigate } from 'react-router-dom'
import SegmentedControl from '../../../../components/shared/SegmentedControl'
import StatusBadge from '../../../../components/coordinator/StatusBadge'
import Button from '../../../../components/shared/Button'
import ResultsTab from './tabs/ResultsTab'
import {
  ArrowLeft, FlagBanner, Eye, LinkSimple, PencilSimple, Export,
  Info, Path, SquaresFour, Gear, Scales, Trophy,
} from '@phosphor-icons/react'
import styles from './SpecificEventPage.module.css'

// ── Danh sách tab (value = segment trên URL) ──
const TABS = [
  { value: 'overview',   label: 'Tổng quan',     icon: Info },
  { value: 'rounds',     label: 'Vòng thi',      icon: Path },
  { value: 'scoring',    label: 'Chấm điểm',     icon: PencilSimple },
  { value: 'ranking',    label: 'Xếp hạng và Trao thưởng', icon: Trophy },
]
const TAB_VALUES = TABS.map((t) => t.value)
const DEFAULT_TAB = 'overview'

// Mock tạm cho hero — fullstack thay bằng data fetch theo eventId
const MOCK_EVENT = { name: 'SEAL Hackathon Summer 2026', status: 'live' }

// -- Panel rỗng tạm cho tab chưa dựng --
function TabPlaceholder({ label }) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderText}>{label} làm sau</span>
    </div>
  )
}

/**
 * SpecificEventPage — trang quản lí 1 sự kiện (view BTC)
 * Tab điều khiển bằng URL: /admin/coordinator/events/:eventId/:tab
 */
function SpecificEventPage({ event = MOCK_EVENT }) {
  const { eventId, tab } = useParams()
  const navigate = useNavigate()

  // Tab hợp lệ lấy từ URL, fallback overview
  const activeTab = TAB_VALUES.includes(tab) ? tab : DEFAULT_TAB

  const goTab = (value) => navigate(`/admin/coordinator/events/${eventId}/${value}`)
  const goBack = () => navigate('/admin/coordinator/events')

  // -- Body theo tab. Mỗi tab tự giữ state riêng bên trong nó. --
  const renderBody = () => {
    switch (activeTab) {
      case 'scoring':
        return <TabPlaceholder label="Chấm điểm" />
      case 'ranking':
        return <ResultsTab />
      case 'overview':
        return <TabPlaceholder label="Tổng quan" />
      case 'rounds':
        return <TabPlaceholder label="Vòng thi" />
      default:
        return null
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div style={{ alignSelf: 'flex-start' }}>
          <button type="button" className={styles.backBtn} onClick={goBack}>
            <ArrowLeft size={18} weight="bold" />
            <span>Quay lại trang quản lí các sự kiện</span>
          </button>
        </div>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroTitleRow}>
            <FlagBanner size={30} weight="fill" className={styles.heroIcon} />
            <h1 className={styles.heroTitle}>{event.name}</h1>
            <StatusBadge status={event.status} size="md" />
          </div>
          <div className={styles.heroBottom}>
            <div className={styles.heroLinks}>
              <button type="button" className={styles.heroLink}>
                <Eye size={18} weight="bold" />
                <span>Xem trang sự kiện</span>
              </button>
              <span className={styles.heroLinkSep} />
              <button type="button" className={styles.heroLink}>
                <LinkSimple size={18} weight="bold" />
                <span>Sao chép liên kết</span>
              </button>
            </div>
            <div className={styles.heroActions}>
              <Button label="Chỉnh sửa" icon={PencilSimple} iconWeight='fill' color="green" variant="primary" onClick={() => navigate(`/admin/coordinator/events/manage/${eventId}`)} />
              <Button label="Xuất báo cáo" icon={Export} color="blue" variant="outline" className={styles.heroExport} />
            </div>
          </div>
        </section>

        {/* ── Thanh tab (sticky dưới header) ── */}
        <div className={styles.tabBar}>
          <SegmentedControl options={TABS} value={activeTab} onChange={goTab} />
        </div>

        {/* ── Body theo tab ── */}
        <main className={styles.body} key={activeTab}>
          {renderBody()}
        </main>
      </div>
    </div>
  )
}

export default SpecificEventPage