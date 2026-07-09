import StickyHeader from '../../components/shared/StickyHeader'
import ResizableSplit from '../../components/shared/ResizableSplit'
import ScoringTeamHero from '../../components/panelist/scoring/ScoringTeamHero'
import SubmissionPanel from '../../components/panelist/scoring/SubmissionPanel'
import ScoringPanel from '../../components/panelist/scoring/ScoringPanel'
import styles from './JudgeScoringPage.module.css'

// ══ Mock data (thay bằng dữ liệu API sau) ══

// Đổi status thành 'unscored' | 'draft' | 'done' để xem các trường hợp khác nhau.
const mockTeam = {
  name: 'NeuralNova',
  status: 'unscored',
  category: 'AI Agents for Software Innovation',
  code: 'SEAL-A07',
  submittedAt: '2026-07-09T14:30:00',
  flaggedViolation: false,
  members: [
    { id: 'm1', name: 'Nguyễn Thành Thái', position: 'AI Engineer', isLeader: true },
    { id: 'm2', name: 'Hồ Ngọc Bảo Trân', position: 'Frontend Developer' },
    { id: 'm3', name: 'Bùi Thiên Khánh', position: 'Backend Developer' },
    { id: 'm4', name: 'Mạc Minh Tùng', position: 'Data Engineer' },
    { id: 'm5', name: 'Phạm Khắc Đăng Khoa', position: 'UI/UX Designer' },
  ],
}

const mockSubmission = {
  github: {
    url: 'https://github.com/react/react',
  },
  slide: { url: 'https://drive.google.com/file/d/1wJVDgrYoYjIfSaWGFcT_B9s3GyAMOGxm/view?usp=sharing', fileUrl: null },
  video: { url: 'https://www.youtube.com/', fileUrl: null },
}

const mockRubric = {
  name: 'SEAL 2026',
  criteria: [
    { id: 'c1', name: 'Tính khả thi kỹ thuật', description: 'Mức độ hoàn thiện và khả năng triển khai thực tế của sản phẩm.', points: 2.5, percent: 25 },
    { id: 'c2', name: 'Sáng tạo & đổi mới', description: 'Ý tưởng mới lạ, giải pháp khác biệt so với thị trường hiện có.', points: 2.5, percent: 25 },
    { id: 'c3', name: 'Thiết kế trải nghiệm', description: 'Giao diện, trải nghiệm người dùng và tính dễ sử dụng.', points: 2.0, percent: 20 },
    { id: 'c4', name: 'Tác động & tiềm năng', description: 'Khả năng mở rộng và tác động thực tế nếu được triển khai.', points: 3.0, percent: 30 },
  ],
}

// Dùng khi status là 'draft' hoặc 'done'.
const mockExisting = {
  scores: { c1: 8, c2: 7, c3: 6.5, c4: 7.5 },
  notes: {
    c1: 'Sản phẩm chạy ổn định, có CI/CD đầy đủ.',
    c4: 'Tiềm năng mở rộng B2B rõ ràng.',
  },
  overall: 'Bài làm chỉn chu, trình bày rõ ràng. Cần bổ sung test coverage cho phần core.',
  audit: { savedAt: '2026-07-09T10:05:00', submittedAt: null },
  hasDiscrepancy: true,
}

/**
 * JudgeScoringPage — trang chấm điểm cụ thể của BGK cho một bài nộp.
 * Bên trái: xem nội dung nộp. Bên phải: bảng chấm điểm theo rubric.
 * Hai pane có thể kéo để đổi độ rộng.
 */
function JudgeScoringPage({
  team = mockTeam,
  submission = mockSubmission,
  rubric = mockRubric,
  existing = mockExisting,
  backLink = '/panelist/events/1/judge/rounds/r3',
}) {
  // Stub hành vi — nối API sau.
  const handleSaveDraft = (payload) => console.log('save-draft', payload)
  const handleSubmit = (payload) => console.log('submit-score', payload)
  const handleRequestEdit = () => console.log('request-edit')
  const handleOpenRubric = () => console.log('open-rubric')
  const handleToggleViolation = (next) => console.log('toggle-violation', next)

  return (
    <div className={styles.page}>
      <StickyHeader
        title={`Chấm điểm · ${team.name}`}
        backLink={backLink}
        backTooltip="Quay lại danh sách đội cần chấm"
      />

      <div className={styles.body}>
        <ScoringTeamHero team={team} onToggleViolation={handleToggleViolation} />

        <ResizableSplit
          storageKey="judgeScoringSplit"
          min={40}
          max={60}
          initialLeft={54}
          left={<SubmissionPanel submission={submission} />}
          right={
            <ScoringPanel
              rubric={rubric}
              criteria={rubric.criteria}
              status={team.status}
              existing={existing}
              onOpenRubric={handleOpenRubric}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              onRequestEdit={handleRequestEdit}
            />
          }
        />
      </div>
    </div>
  )
}

export default JudgeScoringPage
