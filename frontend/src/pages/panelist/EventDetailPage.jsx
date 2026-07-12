import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import axiosClient from '../../api/axiosClient';

function EventDetailPage() {
  const { eventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialTab = searchParams.get('tab') === 'judge' ? 'judge' : 'mentor';
  const [activeTab, setActiveTab] = useState(initialTab);

 useEffect(() => {
  async function fetchEventDetail() {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosClient.get(`/mentor-judge/assigned-event`);
      const data = response.data;

      // 1. LẤY DANH SÁCH ROUNDS THÔNG MINH:
      // Nếu có data của judge thì lấy ở judge, nếu không thì lấy danh sách chặng ở milestones (đều biểu diễn số vòng thi của event)
      const rawRounds = data.assignment?.judge?.rounds || data.assignment?.mentor?.milestones || [];
      const mappedRounds = rawRounds.map(r => ({
        id: String(r.roundId || r.id),
        name: r.name || r.title,
        ordinal: r.roundId || r.id
      }));

      const formattedEvent = {
        id: data.id,
        name: data.name,
        theme: data.theme,
        description: data.description,
        roles: data.roles || [],
        rounds: mappedRounds, // Hết lỗi hiển thị 0 vòng thi

        teamCount: data.stats?.teamCount || 0,
        trackCount: data.stats?.categoryCount || 0,
        roundCount: data.stats?.roundCount || 0,

        assignment: {
          judge: data.assignment?.judge ? {
            rounds: data.assignment.judge.rounds?.map(r => ({
              id: String(r.roundId),
              name: r.name,
              ordinal: r.roundId,
              lifecycle: r.status?.toLowerCase() === 'in_progress' ? 'active' : (r.status?.toLowerCase() || 'active'),
              assigned: true,
              allCategories: r.allCategories,
              categories: r.categories || [],
              rubricName: 'Tiêu chí chấm thi',
              scoredCount: 0,
              totalSubmissions: 0,
              timeStart: r.timeStart ? new Date(r.timeStart) : null,
              timeEnd: r.timeEnd ? new Date(r.timeEnd) : null
            })) || []
          } : null, // Trả về đúng null nếu không phải Judge
          
          mentor: data.assignment?.mentor || null
        },

        currentRound: data.currentRound ? {
          id: String(data.currentRound.id),
          index: data.currentRound.index,
          total: data.currentRound.total,
          name: data.currentRound.name,

          startTimeText: data.currentRound.startTime ? new Date(data.currentRound.startTime).toLocaleDateString('vi-VN') : '',
          endTimeText: data.currentRound.endTime ? new Date(data.currentRound.endTime).toLocaleDateString('vi-VN') : '',

          timeStart: new Date(data.currentRound.startTime),
          timeEnd: new Date(data.currentRound.endTime),
          submissionDeadline: data.currentRound.submissionDeadline ? new Date(data.currentRound.submissionDeadline) : null,

          schedule: data.currentRound.schedule || [],
          timelines: data.currentRound.schedule?.map((s, idx) => ({
            id: idx,
            name: s.title,
            description: s.desc,
            timeStart: s.time.split(' - ')[0] || '00:00',
            timeEnd: s.time.split(' - ')[1] || '00:00'
          })) || []
        } : null
      };

      setEvent(formattedEvent);
    } catch (err) {
      console.error('Error synchronizing event components:', err);
      setError(err.response?.data?.message || 'Không thể đồng bộ cấu trúc dữ liệu vòng thi.');
    } finally {
      setLoading(false);
    }
  }

  if (eventId) {
    fetchEventDetail();
  }
}, [eventId]);

const isMentor = event?.roles?.includes('mentor');
const isJudge = event?.roles?.includes('judge');

// 3. ẨN/HIỆN TAB THEO ĐÚNG ROLE THỰC TẾ
const tabs = useMemo(() => {
  if (!event) return [];
  const listTabs = [];

  if (isMentor) {
    const mentorCategory = event.assignment?.mentor?.category;
    listTabs.push({
      value: 'mentor',
      label: mentorCategory ? `Mentor (${mentorCategory})` : 'Mentor',
      icon: Users,
    });
  }

  if (isJudge) {
    listTabs.push({ 
      value: 'judge', 
      label: 'Giám khảo', 
      icon: Pen 
    });
  }

  return listTabs;
}, [event, isMentor, isJudge]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Đang tải..." backLink="/panelist/dashboard" />
        <div className={styles.loadingContainer}>
          <p>Đang cấu hình dữ liệu cuộc thi...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Lỗi kết nối" backLink="/panelist/dashboard" />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error || 'Không tìm thấy cuộc thi.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <StickyHeader
        title={event.name}
        backLink="/panelist/dashboard"
        backTooltip="Quay lại trang tổng quan"
      />

      <div className={styles.body}>
        <div className={styles.topSection}>
          <div className={styles.headerCol}>
            <EventDetailHeader event={event} />
          </div>
          <div className={styles.metaCol}>
            <EventMetaBox event={event} />
          </div>
        </div>

        <SegmentedControl variant='primary' options={tabs} value={activeTab} onChange={handleTabChange} />

        {/* Tab Mentor */}
        {activeTab === 'mentor' &&
          (isMentor ? (
            <div className={styles.layoutMentor}>
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

        {/* Tab Giám khảo */}
        {activeTab === 'judge' &&
          (isJudge ? (
            <div className={styles.layoutJudge}>
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