import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Path, Warning } from '@phosphor-icons/react'
import DonutChart from '../../shared/DonutChart'
import TimelineVertical from '../../shared/TimelineVertical'
import Button from '../../shared/Button'
import styles from './MentorSidebar.module.css'

// ==========================================
// MOCK DATA
// ==========================================
const ENABLE_MOCK_MENTOR_TIMELINE = false;

/**
 * MentorSidebar — cột phải sticky của tab Mentor.
 * Gồm: biểu đồ tròn thống kê trạng thái đội + timeline mốc tổng thể.
 *
 * @param {object} event
 */
function MentorSidebar({ event }) {
  const mentor = event.assignment?.mentor ?? {}
  const teams = mentor.teams ?? []

  // ── Thống kê số đội theo trạng thái ──
  // "Đang thi đấu" bao gồm cả đội "cần chú ý"; số cần chú ý tách ra note riêng.
  const { segments, attentionCount } = useMemo(() => {
    const counts = teams.reduce((acc, t) => {
      let s = t.status || 'competing'
      if (['approved', 'active', 'live'].includes(s)) s = 'competing'
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {})
    const attention = counts.attention ?? 0
    const competing = (counts.competing ?? 0) + attention

    const list = [
      {
        key: 'competing',
        label: 'Đang thi đấu',
        color: 'var(--color-primary-blue)',
        value: competing,
        note: attention > 0 ? `Trong đó ${attention} đội cần chú ý` : undefined,
      },
      { key: 'top', label: 'Lọt top', color: 'var(--color-primary-green)', value: counts.top ?? 0 },
      { key: 'stopped', label: 'Đã dừng bước', color: 'var(--color-text-muted)', value: counts.stopped ?? 0 },
    ].filter((s) => s.value > 0)

    return { segments: list, attentionCount: attention }
  }, [teams])

  // ── Mốc tổng thể cho timeline (chuyển string -> Date) ──
  const navigate = useNavigate();

  const milestones = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (mentor.milestones ?? []).map((m, index) => {
      const _date = m.date ? new Date(m.date) : null;
      // Force isDone cho vòng đầu tiên (hoặc nếu date < today) để test
      const isDone = (_date && _date < today) || m.status?.toLowerCase() === 'completed' || (ENABLE_MOCK_MENTOR_TIMELINE && index === 0);

      return {
        id: m.id,
        title: m.title,
        date: _date,
        endDate: m.endDate ? new Date(m.endDate) : null,
        description: m.description,
        action: isDone ? (
          <div style={{ marginTop: '0.3em' }}>
            <Button 
              className={styles.btnSmall}
              label="Xem kết quả" 
              labelSize={18}
              variant="primary" 
              color="green" 
              onClick={() => navigate(`/panelist/events/${event.id}/mentor/rounds/${m.id}/leaderboard`)} 
            />
          </div>
        ) : null
      };
    });
  }, [mentor.milestones, event.id, navigate]);

  return (
    <div className={styles.stack}>
      {/* Thống kê đội */}
      <section className={styles.card}>
        <span className={styles.cardTitle}>Tổng quan đội phụ trách</span>
        <DonutChart segments={segments} size={180} thickness={24} centerLabel="đội phụ trách" />
        {attentionCount > 0 && (
          <div className={styles.attentionNote}>
            <Warning size={16} weight="fill" />
            <span>
              <strong>{attentionCount}</strong> đội cần chú ý
            </span>
          </div>
        )}
      </section>

      {/* Timeline mốc tổng thể */}
      <section className={styles.card}>
        <span className={styles.cardTitle}>
          <Path size={18} weight="fill" className={styles.titleIcon} />
          Mốc quan trọng
        </span>
        <div className={styles.timelineWrap}>
          <TimelineVertical showToday={false} milestones={milestones} />
        </div>
      </section>
    </div>
  )
}

export default MentorSidebar