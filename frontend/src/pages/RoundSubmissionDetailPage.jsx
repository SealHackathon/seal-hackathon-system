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

// ==========================================
// MOCK DATA
// ==========================================
const ENABLE_MOCK_ROUND_DETAIL = true;

const MOCK_ROUND_DETAILS = {
  roundId: 'mock-round-1',
  roundName: 'Vòng 0: Sàng lọc hồ sơ (Mock)',
  roundOrdinalNumber: 0,
  roundQuantity: 3,
  roundStartTime: '2026-06-01T00:00:00',
  roundEndTime: '2026-06-15T23:59:59',
  roundSubmissionDeadline: '2026-06-15T23:59:59',
  status: 'COMPLETED',
  submissionConfig: {
    title: 'Hoàn thiện hồ sơ',
    submissionInstructions: 'Nộp đầy đủ thông tin để sàng lọc',
    openingTime: '2026-06-01T00:00:00'
  },
  criteria: [{ name: 'Ý tưởng' }, { name: 'Đội ngũ' }]
};

const MOCK_ACTIVE_SUBMISSION = {
  id: 'mock-sub-1',
  githubUrl: 'https://github.com/mock/repo',
  demoUrl: 'https://youtube.com/mock',
  documentUrl: 'https://docs.google.com/mock',
  submittedAt: '2026-06-10T15:30:00',
  lastEditedAt: '2026-06-10T15:30:00',
  isLate: false,
  score: 8.5,
  comments: ['Tốt', 'Cần cải thiện phần demo'],
  judgesCount: 2
};

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

  const [submissionId, setSubmissionId] = useState(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [realSubmission, setRealSubmission] = useState(null)
  const [teamStatus, setTeamStatus] = useState(null)
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

        // 1. Fetch thông tin vòng thi
        let details = null;
        if (ENABLE_MOCK_ROUND_DETAIL && roundId === 'mock-round-1') {
          details = MOCK_ROUND_DETAILS;
        } else {
          const roundRes = await axiosClient.get(`/round/rounds/${roundId}`)
          details = roundRes.data
        }
        if (!details) {
          throw new Error('Không nhận được dữ liệu vòng thi.')
        }

        // 2. Fetch thông tin team
        let teamTrack = 'Chưa phân nhánh'
        try {
          const teamRes = await axiosClient.get('/team/team-info')
          if (teamRes.data?.category?.trackName) {
            teamTrack = teamRes.data.category.trackName
          }
          if (teamRes.data?.teamStatus) {
            setTeamStatus(teamRes.data.teamStatus)
          }
        } catch (e) {
          console.warn('Không thể lấy thông tin đội:', e)
        }

        // FETCH BÀI NỘP HIỆN TẠI CỦA TEAM
        let activeSubmission = null
        if (ENABLE_MOCK_ROUND_DETAIL && roundId === 'mock-round-1') {
           activeSubmission = MOCK_ACTIVE_SUBMISSION;
           setSubmissionId(activeSubmission.id);
           setIsUpdate(true);
           setRealSubmission({
             github: { mode: 'link', value: activeSubmission.githubUrl },
             video: { mode: 'link', value: activeSubmission.demoUrl },
             slide: { mode: 'link', value: activeSubmission.documentUrl },
             submittedAt: formatDateLabel(activeSubmission.submittedAt),
             lastEditedAt: formatDateLabel(activeSubmission.lastEditedAt),
             late: false,
             score: activeSubmission.score,
             comment: activeSubmission.comments.map((c, index) => `Giám khảo ${index + 1}: ${c}`),
             judge: `Hội đồng giám khảo (${activeSubmission.judgesCount} người đã chấm)`
           });
        } else {
          try {
            // Thay thế chính xác endpoint mà bạn vừa cấu hình ở Backend
            const subRes = await axiosClient.get(`/submission/current?roundId=${roundId}`)

            // Nếu status là 200 và có data trả về (đã từng nộp)
            if (subRes.status === 200 && subRes.data) {
              activeSubmission = subRes.data;
              setSubmissionId(activeSubmission.id); // Lưu lại ID để phục vụ lệnh PUT
              setIsUpdate(true);                    // Đánh dấu chuyển form sang trạng thái cập nhật (PUT)

              // ĐƯA DỮ LIỆU THẬT VÀO STATE
              setRealSubmission({
                github: { mode: 'link', value: activeSubmission.githubUrl },
                video: {
                  mode: activeSubmission.demoUrl?.startsWith('http') ? 'link' : 'file',
                  value: activeSubmission.demoUrl
                },
                slide: {
                  mode: activeSubmission.documentUrl?.startsWith('http') ? 'link' : 'file',
                  value: activeSubmission.documentUrl
                },
                submittedAt: formatDateLabel(activeSubmission.submittedAt),
                lastEditedAt: formatDateLabel(activeSubmission.lastEditedAt || activeSubmission.submittedAt),
                late: activeSubmission.isLate || false,

                // Điểm trung bình cộng hệ 10 của toàn bộ hội đồng giám khảo
                score: activeSubmission.score !== null ? activeSubmission.score : null,

                // Duyệt mảng tạo danh sách nhận xét
                comment: activeSubmission.comments && activeSubmission.comments.length > 0
                  ? activeSubmission.comments.map((c, index) => `Giám khảo ${index + 1}: ${c}`)
                  : null,

                //  Hiển thị động số lượng người đã nộp điểm
                judge: activeSubmission.judgesCount > 0
                  ? `Hội đồng giám khảo (${activeSubmission.judgesCount} người đã chấm)`
                  : 'Chưa có kết quả chấm điểm',
              });
            } else {
              setIsUpdate(false);                  // Nhận diện HTTP 204 No Content -> Dùng POST để tạo mới
              setRealSubmission(null);             // Chưa nộp bài
            }
          } catch (e) {
            console.log('Chưa có bài nộp nào cho vòng này hoặc phát sinh lỗi, mặc định dùng POST.', e)
            setIsUpdate(false)
            setRealSubmission(null)
          }
        }

        if (!isMounted) return

        // Map thông tin cấu hình vòng thi
        const guidelinesText = details.submissionConfig?.submissionInstructions || ''
        const guidelines = guidelinesText
          ? guidelinesText.split('\n').map(line => line.trim()).filter(Boolean)
          : [
            'Nộp bản demo hoàn chỉnh và báo cáo sản phẩm để hội đồng đánh giá.',
            'Đảm bảo link demo và link source code (Github) hoạt động bình thường.',
            'Cung cấp tài khoản test nếu ứng dụng yêu cầu đăng nhập.'
          ]

        const criteria = details.criteria?.map(item => item.name) ?? []

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

        // 4. Khởi tạo dữ liệu cho Form dựa trên bài nộp thật từ DB
        if (activeSubmission) {
          // Map dữ liệu từ API Response về cấu trúc form mong muốn
          const existingForm = {
            github: { mode: 'link', value: activeSubmission.githubUrl || '', file: null },
            video: {
              mode: activeSubmission.demoUrl?.startsWith('http') ? 'link' : 'file',
              value: activeSubmission.demoUrl || '',
              file: null
            },
            slide: {
              mode: activeSubmission.documentUrl?.startsWith('http') ? 'link' : 'file',
              value: activeSubmission.documentUrl || '',
              file: null
            }
          }
          setForm(existingForm)
          setValidFields(computeValidFields(existingForm))
        } else {
          // Nếu chưa nộp bài bao giờ, để form trống
          setForm(createEmptyForm())
          setValidFields({})
        }

        // Tính toán trạng thái đóng/mở vòng thi
        const now = new Date()
        const start = details.roundStartTime ? new Date(details.roundStartTime) : null
        const end = details.roundEndTime ? new Date(details.roundEndTime) : null
        const deadline = details.roundSubmissionDeadline ? new Date(details.roundSubmissionDeadline) : null

        let derivedState = 'active'
        if (start && now < start) {
          derivedState = 'upcoming'
        } else if (end && now > end) {
          derivedState = 'done_closed'
        } else if (deadline && now > deadline) {
          derivedState = 'late'
        } else if (!start && !end) {
          if (details.status === 'UPCOMING') derivedState = 'upcoming'
          else if (details.status === 'COMPLETED') derivedState = 'done_closed'
        }

        const userRole = teamRole?.toLowerCase() === 'leader' ? 'leader' : 'member'
        const editable = userRole === 'leader' && (derivedState === 'active' || derivedState === 'late')
        setIsEditing(editable && !activeSubmission) // Nếu đã có bài nộp thì hiển thị chế độ Read-only trước

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

    if (start && now < start) {
      currentState = 'upcoming'
    } else if (end && now > end) {
      currentState = 'done_closed'
    } else if (deadline && now > deadline) {
      currentState = 'late'
    } else if (!start && !end) {
      if (round.rawStatus === 'UPCOMING') currentState = 'upcoming'
      else if (round.rawStatus === 'COMPLETED') currentState = 'done_closed'
      else currentState = 'active'
    } else {
      currentState = 'active'
    }
  }

  const isEditable = teamStatus !== 'BANNED' && userRole === 'leader' && (currentState === 'active' || currentState === 'late')
  const isLate = currentState === 'late'
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
    window.location.reload()
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


  // TODO: API submit bài nộp
  // API submit bài nộp
  const handleSubmit = async () => {
    setIsConfirmOpen(false)
    try {
      setLoading(true)

      // Cả TH1 và TH2 đều dùng Multipart Form Data theo thiết kế của Backend
      const formData = new FormData()

      // 1. Gắn các trường text/chuỗi trực tiếp vào formData (Flat structure)
      // Chú ý: Backend dùng key "githUrl" (không có chữ e)
      formData.append('githUrl', form.github.value || '')

      // Xử lý logic URL hoặc để trống tùy theo mode link
      const demoUrlVal = form.video.mode === 'link' ? form.video.value : ''
      const docUrlVal = form.slide.mode === 'link' ? form.slide.value : ''
      formData.append('demoUrl', demoUrlVal)
      formData.append('documentUrl', docUrlVal)

      // 2. Gắn các file nếu có
      if (form.video.mode === 'file' && form.video.file instanceof File) {
        formData.append('demoFile', form.video.file)
      }
      if (form.slide.mode === 'file' && form.slide.file instanceof File) {
        formData.append('documentFile', form.slide.file)
      }

      if (!isUpdate) {
        // ==========================================
        // TH 1: CHƯA CÓ BÀI NỘP -> POST (/submit)
        // ==========================================
        // Cần thêm roundId đối với bài nộp mới
        formData.append('roundId', parseInt(roundId, 10))

        const response = await axiosClient.post('/submission/submit', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
             timeout: 0 
        })

        if (response.status === 201 || response.status === 200) {
          alert('Nộp bài thành công!')
          setIsEditing(false)
          window.location.reload()
        }

      } else {
        // ==========================================
        // TH 2: ĐÃ CÓ BÀI NỘP -> PUT (/updateSumssion/{id})
        // ==========================================
        // Phải gọi đúng URL đang viết sai chính tả ở Backend: /updateSumssion/...
        // Và phải truyền kèm headers multipart/form-data
        const response = await axiosClient.put(`/submission/updateSumssion/${submissionId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 0 
        })

        if (response.status === 200) {
          alert('Cập nhật bài nộp thành công!')
          setIsEditing(false)
          window.location.reload()
        }
      }

    } catch (err) {
      console.error('Lỗi khi nộp/cập nhật bài:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra.'
      alert(`Thao tác thất bại: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
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
              <SummaryCard submission={realSubmission} state={currentState} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
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