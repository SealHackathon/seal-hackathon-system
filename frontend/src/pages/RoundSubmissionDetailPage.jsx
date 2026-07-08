import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import axiosClient from '../api/axiosClient'
import { useAuth } from '../AuthContext'

function formatDateLabel(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mkSub(late, edited, score, comment) {
  return {
    github: { mode: 'link', value: '' },
    video: { mode: 'link', value: '' },
    slide: { mode: 'file', value: '', size: '8.4 MB' },
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
  const location = useLocation()
  const { teamRole } = useAuth()

  const searchParams = new URLSearchParams(location.search)
  const roundId = searchParams.get('roundId')

  const [round, setRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(createEmptyForm())
  const [errors, setErrors] = useState({})
  const [validFields, setValidFields] = useState({})
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [criteria, setCriteria] = useState([]);


  useEffect(() => {
    if (!roundId) {
      setError('Thiếu thông tin roundId trên URL.')
      setLoading(false)
      return
    }

    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch round details
        const roundRes = await axiosClient.get(`/round/rounds/${roundId}`)
        const details = roundRes.data
        if (!details) {
          throw new Error('Không nhận được dữ liệu vòng thi.')
        }

        // Fetch team info (optional, fallback if no team)
        let teamTrack = 'Chưa phân nhánh'
        try {
          const teamRes = await axiosClient.get('/team/team-info')
          if (teamRes.data?.category.trackName) {
            teamTrack = teamRes.data.category.trackName
          }
        } catch (e) {
          console.warn('Không thể lấy thông tin đội:', e)
        }

        if (!isMounted) return

        const guidelinesText = details.submissionConfig?.submissionInstructions || ''
        const guidelines = guidelinesText
          ? guidelinesText.split('\n').map(line => line.trim()).filter(Boolean)
          : [
            'Nộp bản demo hoàn chỉnh và báo cáo sản phẩm để hội đồng đánh giá.',
            'Đảm bảo link demo và link source code (Github) hoạt động bình thường.',
            'Cung cấp tài khoản test nếu ứng dụng yêu cầu đăng nhập.'
          ]



        const criteria =
          details.criteria?.map(item => item.name) ?? []

        const mappedRound = {
          id: details.roundId,
          name: details.roundName,
          order: `Vòng ${details.roundOrdinalNumber} / ${details.roundQuantity}`,
          track: teamTrack,
          desc: details.submissionConfig?.title || 'Hoàn thiện sản phẩm và nộp báo cáo.',
          openAt: formatDateLabel(details.roundStartTime) || '—',
          closeAt: formatDateLabel(details.roundSubmissionDeadline || details.roundEndTime) || '—',
          submissionOpenAt: formatDateLabel(details.submissionConfig?.openingTime) || '—',
          guidelines,
          criteria,
          rawStart: details.roundStartTime,
          rawEnd: details.roundEndTime,
          rawDeadline: details.roundSubmissionDeadline,
          rawStatus: details.status,
        }

        setRound(mappedRound)



        // Initialize form
        const submission = SCENARIO.submission
        const newForm = submission ? buildFormFromSubmission(submission) : createEmptyForm()
        setForm(newForm)
        setValidFields(submission ? computeValidFields(newForm) : {})

        // Compute derivedState
        const now = new Date()
        const start = details.roundStartTime ? new Date(details.roundStartTime) : null
        const end = details.roundEndTime ? new Date(details.roundEndTime) : null
        const deadline = details.roundSubmissionDeadline ? new Date(details.roundSubmissionDeadline) : null

        let derivedState = 'active'
        if (details.status === 'UPCOMING' || (start && now < start)) {
          derivedState = 'upcoming'
        } else if (details.status === 'COMPLETED' || (end && now > end)) {
          derivedState = 'done_closed'
        } else if (deadline && now > deadline) {
          derivedState = 'late'
        } else {
          derivedState = 'active'
        }

        const userRole = teamRole?.toLowerCase() === 'leader' ? 'leader' : 'member'
        const editable = userRole === 'leader' && (derivedState === 'active' || derivedState === 'late')
        setIsEditing(editable && !submission)

      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError(err.response?.data || err.message || 'Có lỗi xảy ra khi tải dữ liệu vòng thi.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [roundId, teamRole])

  const userRole = teamRole?.toLowerCase() === 'leader' ? 'leader' : 'member'
  const isMember = userRole === 'member'

  const nowStr = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  let currentState = 'active'
  if (round) {
    const now = new Date()
    const start = round.rawStart ? new Date(round.rawStart) : null
    const end = round.rawEnd ? new Date(round.rawEnd) : null
    const deadline = round.rawDeadline ? new Date(round.rawDeadline) : null

    if (round.rawStatus === 'UPCOMING' || (start && now < start)) {
      currentState = 'upcoming'
    } else if (round.rawStatus === 'COMPLETED' || (end && now > end)) {
      currentState = 'done_closed'
    } else if (deadline && now > deadline) {
      currentState = 'late'
    } else {
      currentState = 'active'
    }
  }

  const isEditable = userRole === 'leader' && (currentState === 'active' || currentState === 'late')
  const isLate = currentState === 'late'
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

  if (loading) {
    return (
      <div className={styles.pageWrap}>
        <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Đang tải dữ liệu vòng thi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.pageWrap}>
        <div className={styles.container}>
          <StickyHeader title="Quay lại Hành trình Dự thi" backLink={handleBack} />
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-primary-orange)' }}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <StickyHeader title="Quay lại Hành trình Dự thi" backLink={handleBack} />

        <div className={styles.grid}>
          {/* Nội dung chính: bên trái */}
          <div className={styles.colMain}>
            <HeroCard round={round} state={currentState} now={nowStr} />

            <div className={styles.guideRow}>
              <div className={styles.guideCol}>
                <GuidelineCard guidelines={round.guidelines} />
              </div>
              <div className={styles.criteriaCol}>
                <CriteriaCard criteria={round.criteria} />
              </div>
            </div>

            {!['upcoming', 'done_closed'].includes(currentState) && (
              <SubmissionForm
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                validFields={validFields}
                setValidFields={setValidFields}
                readOnly={readOnlyForm}
                isEditable={isEditable}
                isMember={isMember}
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
              <TimeCard round={round} state={currentState} now={nowStr} />
              <SummaryCard submission={SCENARIO.submission} state={currentState} />
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