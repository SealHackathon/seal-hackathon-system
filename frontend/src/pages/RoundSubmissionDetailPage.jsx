import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RoundSubmissionDetailPage.module.css'

import HeroCard from '../components/roundSubmissionDetailPage/HeroCard'
import TimeCard from '../components/roundSubmissionDetailPage/TimeCard'
import GuidelineCard from '../components/roundSubmissionDetailPage/GuidelineCard'
import CriteriaCard from '../components/roundSubmissionDetailPage/CriteriaCard'
import SummaryCard from '../components/roundSubmissionDetailPage/SummaryCard'
import SubmissionForm from '../components/roundSubmissionDetailPage/SubmissionForm'
import ConfirmModal from '../components/shared/ConfirmModal'
import StickyHeader from '../components/shared/StickyHeader'
import { REQUIRED_SUBMISSION_FIELDS, validateSubmissionField, computeValidFields } from '../utils/submissionValidation'

// --- Mock Data ---
const ROUND = {
  name: 'Vòng 3: Hoàn thiện Sản phẩm',
  order: 'Vòng 3 / 6',
  track: 'Bảng Tech Innovators',
  desc: 'Hoàn thiện sản phẩm dựa trên phản hồi ở Vòng 2 và nộp bản demo hoàn chỉnh để hội đồng chấm điểm.',
  openAt: '26/06/2026, 08:00',
  closeAt: '07/07/2026, 23:59',
  guidelines: [
    'Hoàn thiện theo phản hồi Vòng 2: Cập nhật sản phẩm dựa trên nhận xét của giám khảo ở vòng trước, ưu tiên các điểm bị trừ.',
    'Mở quyền truy cập mã nguồn: Để repository ở chế độ công khai hoặc cấp quyền cho tài khoản BTC để đối soát.',
    'Video demo tối đa 5 phút: Tập trung trình bày luồng tính năng chính và giá trị thực tế của sản phẩm.',
    'Đặt tên file theo quy ước: Dùng cú pháp TenDoi_Vong3 cho mọi file đính kèm để BTC dễ quản lý.',
  ],
  criteria: [
    'Tính chính xác và sự phù hợp với Domain',
    'Kiến trúc Agentic RAG & Giải thuật',
    'Ý tưởng & Thuyết trình',
    'Khả năng thực thi & tính sáng tạo',
    'Trải nghiệm người dùng & Giao diện tương tác',
  ],
}

function mkSub(late, edited, score, comment) {
  return {
    github: { mode: 'link', value: 'https://github.com/tech-innovators/hackathon-v3' },
    video: { mode: 'link', value: 'https://youtu.be/demo-v3-techinnovators' },
    slide: { mode: 'file', value: 'TechInnovators_Vong3.pdf', size: '8.4 MB' },
    submittedAt: late ? '08/07/2026, 09:12' : '05/07/2026, 21:40',
    lastEditedAt: edited || (late ? '08/07/2026, 09:12' : '05/07/2026, 22:15'),
    late: !!late,
    score: score || null,
    comment: comment || null,
    judge: score ? 'Hội đồng giám khảo' : null,
  }
}

const SCENARIO = {
  state: 'active',
  role: 'leader',
  now: '05/07/2026, 14:30',
  submission: mkSub(false),
}

// ── Chuyển 1 hạng mục "dual" (video/slide) từ dữ liệu submission sang state của form ──
function toFieldState(item) {
  return item.mode === 'file'
    ? { mode: 'file', value: '', file: { name: item.value, size: item.size } }
    : { mode: 'link', value: item.value, file: null }
}

function createEmptyForm() {
  return {
    github: { mode: 'link', value: '', file: null },
    video: { mode: 'file', value: '', file: null },
    slide: { mode: 'file', value: '', file: null },
  }
}

// ── Dựng lại state form từ 1 bài nộp đã có — dùng khi load lại trang và khi huỷ chỉnh sửa ──
function buildFormFromSubmission(submission) {
  return {
    github: { mode: 'link', value: submission.github.value, file: null },
    video: toFieldState(submission.video),
    slide: toFieldState(submission.slide),
  }
}

function RoundSubmissionDetailPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(createEmptyForm())
  const [errors, setErrors] = useState({})
  const [validFields, setValidFields] = useState({})
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Nạp dữ liệu bài nộp ban đầu — chạy 1 lần khi mount vì SCENARIO hiện là dữ liệu tĩnh (chưa nối API)
  useEffect(() => {
    const submission = SCENARIO.submission
    const newForm = submission ? buildFormFromSubmission(submission) : createEmptyForm()

    setForm(newForm)
    setValidFields(submission ? computeValidFields(newForm) : {})

    const editable = SCENARIO.role === 'leader' && (SCENARIO.state === 'active' || SCENARIO.state === 'late')
    setIsEditing(editable && !submission)
  }, [])

  const isEditable = SCENARIO.role === 'leader' && (SCENARIO.state === 'active' || SCENARIO.state === 'late')
  const isLate = SCENARIO.state === 'late'
  const isUpdate = !!SCENARIO.submission
  const readOnlyForm = !isEditing

  const readyCount = REQUIRED_SUBMISSION_FIELDS.filter((key) => !!validFields[key]).length

  const handleBack = () => navigate('/team/submissions')

  const handleCancelEdit = () => {
    const submission = SCENARIO.submission
    if (submission) {
      const revertedForm = buildFormFromSubmission(submission)
      setForm(revertedForm)
      setValidFields(computeValidFields(revertedForm))
      setErrors({})
    }
    setIsEditing(false)
  }

  const handleOpenConfirm = () => {
    const newErrors = {}
    const newValid = { ...validFields }
    let hasError = false

    REQUIRED_SUBMISSION_FIELDS.forEach((key) => {
      const err = validateSubmissionField(key, form)
      newValid[key] = !err
      if (err) {
        newErrors[key] = err
        hasError = true
      }
    })

    setValidFields(newValid)

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsConfirmOpen(true)
  }

  const handleSubmit = () => {
    setIsConfirmOpen(false)
    alert('Nộp bài thành công!')
    setIsEditing(false)
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <StickyHeader title="Quay lại Hành trình Dự thi" backLink={handleBack} />

        <div className={styles.grid}>
          {/* Nội dung chính: bên trái */}
          <div className={styles.colMain}>
            <HeroCard round={ROUND} state={SCENARIO.state} now={SCENARIO.now} />

            <div className={styles.guideRow}>
              <div className={styles.guideCol}>
                <GuidelineCard guidelines={ROUND.guidelines} />
              </div>
              <div className={styles.criteriaCol}>
                <CriteriaCard criteria={ROUND.criteria} />
              </div>
            </div>

            {!['upcoming', 'done_closed'].includes(SCENARIO.state) && (
              <SubmissionForm
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                validFields={validFields}
                setValidFields={setValidFields}
                readOnly={readOnlyForm}
                isEditable={isEditable}
                isMember={SCENARIO.role === 'member'}
                readyCount={readyCount}
                totalCount={REQUIRED_SUBMISSION_FIELDS.length}
                isLate={isLate}
                isUpdate={isUpdate}
                onSubmit={handleOpenConfirm}
                onEdit={() => setIsEditing(true)}
                onCancel={handleCancelEdit}
              />
            )}
          </div>

          {/* Nội dung phụ: bên phải, dính khi cuộn */}
          <div className={styles.colSide}>
            <div className={styles.stickySide}>
              <TimeCard round={ROUND} state={SCENARIO.state} now={SCENARIO.now} />
              <SummaryCard submission={SCENARIO.submission} state={SCENARIO.state} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Xác nhận nộp bài"
        message="Bạn có chắc chắn muốn nộp bài? Hệ thống sẽ ghi nhận thời điểm hiện tại và lưu làm kết quả chính thức cho đội."
        confirmLabel={isLate ? 'Chốt nộp bài (Muộn)' : 'Chốt nộp bài'}
        cancelLabel="Huỷ"
        onConfirm={handleSubmit}
        type="primary"
      />
    </div>
  )
}

export default RoundSubmissionDetailPage