import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Pen } from '@phosphor-icons/react';
import StickyHeader from '../../components/shared/StickyHeader';
import SegmentedControl from '../../components/shared/SegmentedControl';
import EmptyState from '../../components/panelist/EmptyState';
import EventDetailHeader from '../../components/panelist/event/EventDetailHeader';
import EventMetaBox from '../../components/panelist/event/EventMetaBox';
import JudgeRoundsTab from '../../components/panelist/event/JudgeRoundsTab';
import JudgeSidebar from '../../components/panelist/event/JudgeSidebar';
import styles from './EventDetailPage.module.css';

// Tab cố định: luôn hiển thị cả 2 vai trò.
// Nếu user không được phân công vai trò nào -> tab đó hiện empty state.
const TABS = [
  { value: 'mentor', label: 'Mentor', icon: Users },
  { value: 'judge', label: 'Giám khảo', icon: Pen },
];

// Mock tạm để xem giao diện - thay bằng data thật từ API.
// Vòng chấm dùng: lifecycle ('upcoming'|'active'|'ended') + assigned (giám khảo có phụ trách hay không).
const mockEvent = {
  name: 'SEAL Hackathon Summer 2026',
  status: 'live',
  theme: 'AI Agents for Software Innovation',
  eventLink: '#',
  timeStart: new Date('2026-06-20'),
  timeEnd: new Date('2026-07-15'),
  teamCount: 24,
  trackCount: 4,
  roles: ['mentor', 'judge'],
  rounds: [
    { id: 'r1', ordinal: 1, name: 'Vòng sơ loại' },
    { id: 'r2', ordinal: 2, name: 'Vòng phát triển' },
    { id: 'r3', ordinal: 3, name: 'Vòng bán kết' },
    { id: 'r4', ordinal: 4, name: 'Vòng chung kết' },
  ],
  assignment: {
    judge: {
      rounds: [
        // Đã kết thúc + KHÔNG được phân công -> tone xanh nhạt, node vẫn là tick xanh.
        {
          id: 'r1', ordinal: 1, name: 'Vòng sơ loại',
          timeStart: new Date('2026-06-20'), timeEnd: new Date('2026-06-25'),
          lifecycle: 'ended', assigned: false,
          allCategories: false, categories: ['Smart City & IoT'], rubricName: 'SEAL 2026',
        },
        // Đã kết thúc + được phân công -> node tick xanh, nút "Xem kết quả".
        {
          id: 'r2', ordinal: 2, name: 'Vòng phát triển',
          timeStart: new Date('2026-06-26'), timeEnd: new Date('2026-07-02'),
          lifecycle: 'ended', assigned: true,
          allCategories: false, categories: ['Smart City & IoT'], rubricName: 'SEAL 2026',
          scoredCount: 30, totalSubmissions: 30,
        },
        // Đang diễn ra + được phân công -> tone xanh dương, nút "Chấm điểm".
        {
          id: 'r3', ordinal: 3, name: 'Vòng bán kết',
          timeStart: new Date('2026-07-03'), timeEnd: new Date('2026-07-09'),
          lifecycle: 'active', assigned: true,
          allCategories: false, categories: ['Smart City & IoT'], rubricName: 'SEAL 2026',
          scoredCount: 15, totalSubmissions: 20,
        },
        // Sắp diễn ra + được phân công -> nút disabled "Chưa tới lượt chấm".
        {
          id: 'r4', ordinal: 4, name: 'Vòng chung kết',
          timeStart: new Date('2026-07-10'), timeEnd: new Date('2026-07-15'),
          lifecycle: 'upcoming', assigned: true,
          allCategories: true, categories: [], rubricName: 'SEAL 2026',
          scoredCount: 0, totalSubmissions: 8,
        },
      ],
    },
  },
};

function EventDetailPage({ event = mockEvent }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'judge' ? 'judge' : 'mentor';
  const [activeTab, setActiveTab] = useState(initialTab);

  const isMentor = event.roles?.includes('mentor');
  const isJudge = event.roles?.includes('judge');

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className={styles.page}>
      {/* Thanh sticky đầu trang: quay lại trang tổng quan + tên sự kiện */}
      <StickyHeader
        title={event.name}
        backLink="/panelist/dashboard"
        backTooltip="Quay lại trang tổng quan"
      />

      <div className={styles.body}>
        {/* Section 1: header xanh + box thông tin cuộc thi (2 cột) */}
        <div className={styles.topSection}>
          <div className={styles.headerCol}>
            <EventDetailHeader event={event} />
          </div>
          <div className={styles.metaCol}>
            <EventMetaBox event={event} />
          </div>
        </div>

        <SegmentedControl variant='primary' options={TABS} value={activeTab} onChange={handleTabChange} />

        {/* Section 2: nội dung tab */}
        {activeTab === 'mentor' &&
          (isMentor ? (
            <div className={styles.placeholder}>Tab Mentor</div>
          ) : (
            <EmptyState
              icon={Users}
              title="Bạn không phụ trách vai trò Mentor"
              description="Bạn chưa được phân công làm mentor cho sự kiện này."
            />
          ))}

        {activeTab === 'judge' &&
          (isJudge ? (
            <div className={styles.layout}>
              <main className={styles.main}>
                <JudgeRoundsTab event={event} />
              </main>
              <aside className={styles.sidebar}>
                <div className={styles.stickyWrap}>
                  <JudgeSidebar event={event} />
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState
              icon={Pen}
              title="Bạn không phụ trách chấm thi"
              description="Bạn chưa được phân công làm giám khảo cho sự kiện này."
            />
          ))}
      </div>
    </div>
  );
}

export default EventDetailPage;
