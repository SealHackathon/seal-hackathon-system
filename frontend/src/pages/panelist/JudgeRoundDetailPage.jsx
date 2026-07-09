import StickyHeader from '../../components/shared/StickyHeader'
import JudgeRoundHero from '../../components/panelist/event/judgeRoundDetail/JudgeRoundHero'
import JudgeScoringProgress from '../../components/panelist/event/judgeRoundDetail/JudgeScoringProgress'
import JudgeSubmissionTable from '../../components/panelist/event/judgeRoundDetail/JudgeSubmissionTable'
import styles from './JudgeRoundDetailPage.module.css'

// Mock tạm để xem giao diện — thay bằng data thật từ API.
const mockRound = {
  id: 'r3',
  ordinal: 3,
  name: 'Vòng bán kết',
  lifecycle: 'active',
  timeStart: new Date('2026-07-01'),
  timeEnd: new Date('2026-07-10'),
  submissionDeadline: new Date('2026-07-10T17:30:00'),
  allCategories: false,
  categories: ['AI Agents for Software Innovation', 'FinTech Innovate'],
  rubricName: 'SEAL 2026',
}

// status: 'unscored' (chưa chấm) | 'draft' (đã lưu nháp) | 'done' (đã chấm xong)
const mockSubmissions = [
  { id: 's1', teamName: 'NeuralNova', leader: 'Nguyễn Minh An', position: 'AI Engineer', memberCount: 5, category: 'AI Agents for Software Innovation', submittedAt: '2026-07-09T14:30:00', status: 'unscored', score: null, submission: { github: true, video: true, slide: true } },
  { id: 's2', teamName: 'CodeCrafters', leader: 'Trần Thu Hà', position: 'Fullstack Dev', memberCount: 4, category: 'AI Agents for Software Innovation', submittedAt: '2026-07-09T09:12:00', status: 'draft', score: 7.6, scoredAt: '2026-07-09T10:05:00', submission: { github: true, video: true, slide: false } },
  { id: 's3', teamName: 'ByteBuilders', leader: 'Lê Hoàng Nam', position: 'Backend Dev', memberCount: 6, category: 'AI Agents for Software Innovation', submittedAt: '2026-07-10T00:14:00', status: 'done', score: 8.4, scoredAt: '2026-07-10T08:30:00', submission: { github: true, video: true, slide: true } },
  { id: 's4', teamName: 'QuantumLeap', leader: 'Vũ Khánh Linh', position: 'Data Scientist', memberCount: 4, category: 'AI Agents for Software Innovation', submittedAt: '2026-07-08T23:59:00', status: 'unscored', score: null, submission: { github: true, video: false, slide: true } },
  { id: 's5', teamName: 'PayWise', leader: 'Phạm Gia Bảo', position: 'Product Manager', memberCount: 5, category: 'FinTech Innovate', submittedAt: '2026-07-08T20:45:00', status: 'done', score: 9.1, scoredAt: '2026-07-09T09:15:00', submission: { github: true, video: true, slide: true } },
  { id: 's6', teamName: 'LedgerLink', leader: 'Đỗ Anh Khoa', position: 'Blockchain Dev', memberCount: 5, category: 'FinTech Innovate', submittedAt: '2026-07-08T18:02:00', status: 'draft', score: 6.8, scoredAt: '2026-07-09T14:20:00', submission: { github: true, video: false, slide: true } },
]

/**
 * JudgeRoundDetailPage — trang chi tiết một vòng chấm của giám khảo.
 * Hàng trên: hero thông tin vòng (~60%) + tiến độ chấm (~40%).
 * Bên dưới: bảng danh sách bài nộp cần chấm (nhóm theo hạng mục).
 *
 * @param {object} [round]
 * @param {Array}  [submissions]
 * @param {string} [backLink]
 */
function JudgeRoundDetailPage({ round = mockRound, submissions = mockSubmissions, backLink = '/panelist/events/1?tab=judge' }) {
  // Đếm số đội theo trạng thái chấm cho box tiến độ.
  const stats = submissions.reduce(
    (acc, s) => {
      if (s.status === 'done') acc.done += 1
      else if (s.status === 'draft') acc.draft += 1
      else acc.unscored += 1
      return acc
    },
    { done: 0, draft: 0, unscored: 0 },
  )

  return (
    <div className={styles.page}>
      <StickyHeader title={round.name} backLink={backLink} backTooltip="Quay lại trang cuộc thi" />

      <div className={styles.body}>
        {/* Hàng trên: hero (60%) + tiến độ chấm (40%) */}
        <div className={styles.heroRow}>
          <JudgeRoundHero round={round} />
          <JudgeScoringProgress done={stats.done} draft={stats.draft} unscored={stats.unscored} />
        </div>

        {/* Danh sách bài nộp cần chấm */}
        <JudgeSubmissionTable submissions={submissions} />
      </div>
    </div>
  )
}

export default JudgeRoundDetailPage
