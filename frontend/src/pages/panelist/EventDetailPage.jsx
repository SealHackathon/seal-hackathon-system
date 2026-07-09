import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Pen } from '@phosphor-icons/react';
import StickyHeader from '../../components/shared/StickyHeader';
import SegmentedControl from '../../components/shared/SegmentedControl';
import EmptyState from '../../components/panelist/EmptyState';
import EventDetailHeader from '../../components/panelist/event/EventDetailHeader';
import EventMetaBox from '../../components/panelist/event/EventMetaBox';
import JudgeRoundsTab from '../../components/panelist/event/JudgeRoundsTab';
import JudgeSidebar from '../../components/panelist/event/JudgeSidebar';
import MentorTab from '../../components/panelist/event/MentorTab';
import MentorSidebar from '../../components/panelist/event/MentorSidebar';
import styles from './EventDetailPage.module.css';

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
    mentor: {
      category: 'AI & Data',
      rounds: [
        { id: 'r1', ordinal: 1, name: 'Vòng sơ loại', timeStart: '2026-06-20', timeEnd: '2026-06-25', lifecycle: 'ended' },
        { id: 'r2', ordinal: 2, name: 'Vòng phát triển', timeStart: '2026-06-26', timeEnd: '2026-07-02', lifecycle: 'ended' },
        { id: 'r3', ordinal: 3, name: 'Vòng bán kết', timeStart: '2026-07-03', timeEnd: '2026-07-09', lifecycle: 'active' },
        { id: 'r4', ordinal: 4, name: 'Vòng chung kết', timeStart: '2026-07-10', timeEnd: '2026-07-15', lifecycle: 'upcoming' },
      ],

      // Mốc tổng thể cho TimelineVertical (mentor theo dõi cả sự kiện, không chỉ round)
      milestones: [
        { id: 'm1', title: 'Khai mạc & phát động', date: '2026-06-18' },
        { id: 'm2', title: 'Vòng sơ loại', date: '2026-06-20', endDate: '2026-06-25' },
        { id: 'm3', title: 'Vòng phát triển', date: '2026-06-26', endDate: '2026-07-02' },
        { id: 'm4', title: 'Vòng bán kết', date: '2026-07-03', endDate: '2026-07-09' },
        { id: 'm5', title: 'Vòng chung kết', date: '2026-07-10', endDate: '2026-07-15' },
        { id: 'm6', title: 'Lễ trao giải', date: '2026-07-16' },
      ],

      // status: 'competing' | 'top' | 'attention' | 'stopped'
      teams: [
        {
          id: 't1', name: 'Neural Ninjas', leader: 'Minh Anh', memberCount: 4, leaderPosition: 'AI Engineer',
          status: 'top', rank: 1, score: 92,
          currentRound: 'Vòng bán kết', progress: { done: 2, total: 4 },
          submission: { github: true, video: true, slide: true },
          questionsTotal: 2, pendingQuestions: 1,
        },
        {
          id: 't2', name: 'Data Dragons', leader: 'Quốc Bảo', memberCount: 5, leaderPosition: 'Data Scientist',
          status: 'attention', score: 70,
          currentRound: 'Vòng bán kết', progress: { done: 2, total: 4 },
          submission: { github: true, video: false, slide: false },
          questionsTotal: 4, pendingQuestions: 3,
        },
        {
          id: 't3', name: 'Cloud Crafters', leader: 'Thu Hà', memberCount: 4, leaderPosition: 'DevOps Engineer',
          status: 'competing', score: 81,
          currentRound: 'Vòng bán kết', progress: { done: 2, total: 4 },
          submission: { github: true, video: true, slide: false },
          questionsTotal: 1, pendingQuestions: 0,
        },
        {
          id: 't4', name: 'Pixel Pioneers', leader: 'Gia Huy', memberCount: 3, leaderPosition: 'UX/UI Designer',
          status: 'attention', score: 64,
          currentRound: 'Vòng bán kết', progress: { done: 2, total: 4 },
          submission: { github: false, video: false, slide: false },
          questionsTotal: 1, pendingQuestions: 1,
        },
        {
          id: 't5', name: 'Quantum Coders', leader: 'Khánh Vy', memberCount: 4, leaderPosition: 'AI Engineer',
          status: 'top', rank: 2, score: 89,
          currentRound: 'Vòng bán kết', progress: { done: 2, total: 4 },
          submission: { github: true, video: true, slide: true },
          questionsTotal: 0, pendingQuestions: 0,
        },
        {
          id: 't6', name: 'Byte Builders', leader: 'Đức Trọng', memberCount: 5, leaderPosition: 'Fullstack Developer',
          status: 'stopped', stoppedRound: 'Vòng phát triển', score: null,
          currentRound: null, progress: { done: 1, total: 4 },
          submission: null,
          questionsTotal: 0, pendingQuestions: 0,
        },
      ],

      // teamId để popup lọc theo đội; có answer/answeredAt => hiện dạng đã trả lời
      
      requests: [
        { id: 'q1', teamId: 't2', teamName: 'Data Dragons', question: 'Cho em hỏi tiêu chí chấm vòng bán kết tính điểm demo hay báo cáo nhiều hơn ạ?', createdAt: '2026-07-09T06:20:00+07:00' },
        { id: 'q2', teamId: 't2', teamName: 'Data Dragons', question: 'Nhóm em được dùng thư viện AI bên thứ ba trong phần demo không thầy/cô?', createdAt: '2026-07-08T20:05:00+07:00' },
        { id: 'q3', teamId: 't2', teamName: 'Data Dragons', question: 'Slide thuyết trình có giới hạn số trang không ạ?', createdAt: '2026-07-08T15:40:00+07:00' },
        {
          id: 'q4', teamId: 't2', teamName: 'Data Dragons', question: 'Deadline nộp video demo là mấy giờ ạ?', createdAt: '2026-07-06T09:10:00+07:00',
          answer: 'Video nộp trước 23:59 ngày cuối vòng bán kết, định dạng mp4 dưới 200MB nhé.', answeredAt: '2026-07-06T10:30:00+07:00'
        },
        { id: 'q5', teamId: 't1', teamName: 'Neural Ninjas', question: 'Nhóm em muốn đổi hướng tiếp cận mô hình ở vòng này, có ảnh hưởng điểm không ạ?', createdAt: '2026-07-08T16:40:00+07:00' },
        {
          id: 'q6', teamId: 't1', teamName: 'Neural Ninjas', question: 'Bọn em muốn hỏi tiêu chí "Tác động & tiềm năng" cụ thể là đánh giá theo quy mô thị trường hay theo mức độ hoàn thiện sản phẩm ạ?', createdAt: '2026-07-09T08:00:00+07:00',
          answer: 'Tiêu chí này đánh giá cả hai yếu tố: quy mô ảnh hưởng thực tế và tính khả thi triển khai nếu được đầu tư thêm. Các em nên nêu rõ cả hai khía cạnh trong slide.', answeredAt: '2026-07-09T10:05:00+07:00'
        },
        { id: 'q7', teamId: 't4', teamName: 'Pixel Pioneers', question: 'Cho em hỏi phần thiết kế UI có được tính vào điểm kỹ thuật không ạ?', createdAt: '2026-07-08T11:25:00+07:00' },
        {
          id: 'q8', teamId: 't3', teamName: 'Cloud Crafters', question: 'Repo GitHub cần để public hay để private rồi add mentor vào ạ?', createdAt: '2026-07-05T14:00:00+07:00',
          answer: 'Để private rồi add tài khoản mentor làm collaborator giúp thầy/cô nhé.', answeredAt: '2026-07-05T15:20:00+07:00'
        },
      ],
    }
  },
};

function EventDetailPage({ event = mockEvent }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'judge' ? 'judge' : 'mentor';
  const [activeTab, setActiveTab] = useState(initialTab);

  const isMentor = event.roles?.includes('mentor');
  const isJudge = event.roles?.includes('judge');

  // Tab Mentor kèm hạng mục phân công trong ngoặc (nếu được phân công và có hạng mục).
  const tabs = useMemo(() => {
    const mentorCategory = event.assignment?.mentor?.category;
    return [
      {
        value: 'mentor',
        label: isMentor && mentorCategory ? `Mentor (${mentorCategory})` : 'Mentor',
        icon: Users,
      },
      { value: 'judge', label: 'Giám khảo', icon: Pen },
    ];
  }, [event, isMentor]);

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

        <SegmentedControl variant='primary' options={tabs} value={activeTab} onChange={handleTabChange} />

        {/* Section 2: nội dung tab */}
        {activeTab === 'mentor' &&
          (isMentor ? (
            <div className={styles.layout}>
              <main className={styles.main}>
                <MentorTab event={event} />
              </main>
              <aside className={styles.sidebar}>
                <div className={styles.stickyWrap}>
                  <MentorSidebar event={event} />
                </div>
              </aside>
            </div>
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
