import { useState, useRef, useEffect } from 'react'
// import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventStickyHeader from '../../../../components/coordinator/events/create/CreateEventStickyHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import Step3Prizes from './steps/Step3Prizes'
import Step4Rounds from './steps/Step4Rounds'
import Step6Timeline from './steps/Step6Timeline';
import Step7MentorJudge from './steps/Step7MentorJudge';
import { handleSaveDraft } from '../../../../api/handleSaveDraft'
import useSticky from '../../../../hooks/useSticky'
import styles from './CreateEventPage.module.css'
import Step5Categories from './steps/Step5Categories'
import axiosClient from '../../../../api/axiosClient'
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../components/shared/ConfirmModal'
import NestedSmoothScroll from '../../../../components/shared/NestedSmoothScroll';

const TOTAL_STEPS = 7



// function StepPlaceholder({ step }) {
//   return (
//     <div className={styles.placeholder}>
//       <p className={styles.placeholderText}>Step {step} — Đang phát triển...</p>
//     </div>
//   )
// }

function CreateEventPage() {
  const navigate = useNavigate(); // 1. Khởi tạo hàm điều hướng
  const [sentinelRef, isSidebarSticky] = useSticky('-73px 0px 0px 0px')
  const [confirmModal, setConfirmModal] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState([1])
  const [errorSteps, setErrorSteps] = useState([])
  const contentInnerRef = useRef(null)
  const pageRef = useRef(null)
  const [naturalHeight, setNaturalHeight] = useState(0)

  useEffect(() => {
    if (!contentInnerRef.current) return
    const observer = new ResizeObserver((entries) => {
      setNaturalHeight(entries[0].target.scrollHeight)
    })
    observer.observe(contentInnerRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll hijacking: khi content sticky, wheel bất kỳ đâu trên trang ⇒ redirect vào content
  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const handleWheel = (e) => {
      const el = contentInnerRef.current
      if (!el) return

      const maxWindowScroll = document.documentElement.scrollHeight - window.innerHeight
      const isWindowAtBottom = window.scrollY >= maxWindowScroll - 2
      const outsideContent = !el.contains(e.target)

      // Cursor ngoài content + page còn scroll được → để browser tự xử lý
      if (outsideContent && !isWindowAtBottom) return

      const isAtTop = el.scrollTop <= 0
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2

      if (e.deltaY > 0) {
        // Scroll xuống
        if (!isWindowAtBottom) {
          // Page vẫn còn scroll được → scroll page trước (cho tới khi info header khuất hết)
          e.preventDefault()
          window.scrollBy({ top: e.deltaY, behavior: 'auto' })
        } else if (!isAtBottom) {
          // Page đã chạm đáy → redirect vào inner content
          e.preventDefault()
          el.scrollTop += e.deltaY
        }
        // Cả hai đều ở đáy → không làm gì
      } else {
        // Scroll lên
        if (!isAtTop) {
          // Inner đã scroll → scroll inner về trước
          e.preventDefault()
          el.scrollTop += e.deltaY
        } else {
          // Inner ở đỉnh → redirect ra window để scroll lên (thoát sticky)
          e.preventDefault()
          window.scrollBy({ top: e.deltaY, behavior: 'auto' })
        }
      }
    }

    page.addEventListener('wheel', handleWheel, { passive: false })
    return () => page.removeEventListener('wheel', handleWheel)
  }, [])  // Chạy 1 lần, handler tự đọc state từ DOM


  // Ẩn window scrollbar khi ở trang này
  useEffect(() => {
    document.documentElement.classList.add('hide-scrollbar')
    return () => document.documentElement.classList.remove('hide-scrollbar')
  }, [])



  const [formData, setFormData] = useState({
    deadlineSameAsClose: true,
    minMembers: 3,
    maxMembers: 4,
    rankCount: 3,
    mainPrizes: [
      { id: 1, rank: 1, defaultName: 'Giải nhất', name: 'Giải nhất', quantity: 1, cash: '', desc: '' },
      { id: 2, rank: 2, defaultName: 'Giải nhì', name: 'Giải nhì', quantity: 1, cash: '', desc: '' },
      { id: 3, rank: 3, defaultName: 'Giải ba', name: 'Giải ba', quantity: 1, cash: '', desc: '' },
    ],
    extendedPrizes: [],
    rounds: [
      {
        id: 'round-1',
        name: 'Vòng Sơ khảo',
        startDate: null,
        endDate: null,
        format: 'offline',
        location: null,
        submissionType: 'new',
        submissionOpen: null,
        submissionDeadline: null,
        submissionGuide: '',
        agenda: [],
        meetingLink: '',
      },
      {
        id: 'round-2',
        name: 'Vòng Chung kết',
        startDate: null,
        endDate: null,
        format: 'offline',
        location: null,
        submissionType: 'new',
        submissionOpen: null,
        submissionDeadline: null,
        submissionGuide: '',
        agenda: [],
        meetingLink: '',
      }
    ],
    categories: [
      { id: 'cat-1', name: '', desc: '', teamLimit: '' }
    ]
  })
  const [status, setStatus] = useState('draft')

  function handleFormChange(field, val) {
    setFormData(prev => ({ ...prev, [field]: val }))
  }


  // nếu chưa điền đủ các thông tin form ko cho nhảy bước
  function validateStep(step) {
    if (step === 1) {
      if (!formData.name?.trim()) return false
      if (!formData.openDate || !formData.closeDate) return false

      const open = new Date(formData.openDate).getTime()
      const close = new Date(formData.closeDate).getTime()
      if (close <= open) return false

      const min = formData.minMembers
      const max = formData.maxMembers
      if (min === '' || min === undefined || min === null) return false
      if (max === '' || max === undefined || max === null) return false
      if (Number(min) < 1 || Number(max) < 1) return false
      if (Number(min) >= Number(max)) return false

      if (!formData.avatarFile || !formData.coverFile) return false

      if (formData.deadlineSameAsClose === false) {
        if (!formData.teamDeadline) return false
        if (new Date(formData.teamDeadline).getTime() < close) return false
      }

      return true
    }
    if (step === 2) {
      const rules = formData.generalRules ?? ''
      const isEmpty = !rules.trim() || rules === '<p></p>' || rules === '<p><br></p>'
      if (isEmpty) return false

      const notes = formData.notes ?? []
      return notes.every(n => n.title?.trim())
    }
    if (step === 3) {
      const mainPrizes = formData.mainPrizes ?? []
      const rankCount = formData.rankCount ?? 3

      // Phải có đủ số giải theo dropdown
      if (mainPrizes.length < rankCount) return false

      // Mỗi giải chính phải điền đủ tên + số lượng
      const mainValid = mainPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1
      )
      if (!mainValid) return false

      // Giải phụ nếu có phải điền tên + số lượng
      const extendedPrizes = formData.extendedPrizes ?? []
      const extValid = extendedPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1
      )
      if (!extValid) return false

      return true
    }
    if (step === 4) {
      const rounds = formData.rounds ?? []
      if (rounds.length === 0) return false
      return rounds.every((r, idx) => {
        if (!r.name?.trim()) return false
        if (!r.startDate || !r.endDate) return false

        const start = new Date(r.startDate).getTime()
        const end = new Date(r.endDate).getTime()
        if (end <= start) return false
        // Kiểm tra thứ tự các vòng thi: Ngày bắt đầu vòng sau >= Ngày kết thúc vòng trước
        if (idx > 0) {
          const prevEnd = new Date(rounds[idx - 1].endDate).getTime()
          if (start < prevEnd) return false
        }

        if (r.format === 'offline' && !r.location) return false
        if (r.format === 'online' && !r.meetingLink?.trim()) return false

        if (r.submissionType === 'new') {
          if (!r.submissionDeadline) return false
          const subDeadline = new Date(r.submissionDeadline).getTime()

          // Hạn nộp bài phải nằm trong thời gian diễn ra vòng
          if (subDeadline <= start || subDeadline >= end) return false

          if (r.submissionOpen) {
            const subOpen = new Date(r.submissionOpen).getTime()
            if (subDeadline <= subOpen) return false
            if (subOpen < start) return false
          }
        }

        // Kiểm tra lịch trình (agenda) của vòng thi
        const agenda = r.agenda ?? []
        const agendaValid = agenda.every((item, i) => {
          if (i === 0) return true
          const prev = agenda[i - 1]
          if (prev.startTime && item.startTime && item.startTime <= prev.startTime) return false
          return true
        })
        if (!agendaValid) return false

        return true
      })
    }
    if (step === 5) {
      const categories = formData.categories ?? []
      if (categories.length === 0) return false
      return categories.every(c => {
        if (!c.name?.trim()) return false
        if (c.teamLimit !== '' && c.teamLimit !== undefined && c.teamLimit !== null) {
          if (Number(c.teamLimit) < 1) return false
        }
        return true
      })
    }
    return true
  }

  function goToStep(step) {
    const isValid = validateStep(currentStep)
    setVisitedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep])
    setErrorSteps(prev =>
      isValid
        ? prev.filter(s => s !== currentStep)
        : prev.includes(currentStep) ? prev : [...prev, currentStep]
    )
    setCurrentStep(step)
    setVisitedSteps(prev => prev.includes(step) ? prev : [...prev, step])
  }
  // --------------------------------------handleNext---------------------------
  async function handleNext() {
    // Chỉ validate form client trước khi cho phép bấm nút gửi
    if (!validateStep(currentStep)) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc trước khi tiếp tục!");
      return;
    }

    // Chờ gọi API lưu dữ liệu thành công rồi mới cho phép chuyển bước
    const isSaveSuccess = await onSaveDraft();

    if (isSaveSuccess && currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  }
  // ------------------------------------------------------------------
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }



  // Trong component:
  async function onSaveDraft() {
    const isSuccess = await handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange });
    if (isSuccess) {
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const timeString = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setLastUpdated(timeString);
    }
    return isSuccess;
  }
  //------------------------------------------------------------------------------------------------

  function handlePublish() { setStatus('live'); console.log('Công bố:', formData) }
  function handlePreview() { console.log('Xem trước:', formData) }
  function handleCancel() {
    setConfirmModal({
      title: 'Xác nhận hủy',
      message: 'Các thông tin cấu hình chưa được bạn Lưu nháp sẽ mất!',
      confirmLabel: 'Đồng ý',
      onConfirm: () => {
        if (formData.id != null) {
          axiosClient.delete(`/event/${formData.id}`).then(
            () => {
              console.log('cancel create event sucess !');
            }
          ).catch((error) => {
            console.log(error)
          })
        }
        navigate('/coordinator/events');
        setConfirmModal(null)
      }
    })
  }

  function renderStep() {
    switch (currentStep) {
      case 1: return <Step1BasicInfo formData={formData} onFormChange={handleFormChange} />
      case 2: return <Step2Rules formData={formData} onFormChange={handleFormChange} />  // ← thêm
      case 3: return <Step3Prizes formData={formData} onFormChange={handleFormChange} />
      case 4: return <Step4Rounds formData={formData} onChange={setFormData} />
      case 5: return <Step5Categories formData={formData} onFormChange={handleFormChange} />
      case 6: return <Step6Timeline formData={formData} onFormChange={handleFormChange} />
      case 7: return <Step7MentorJudge formData={formData} onFormChange={handleFormChange} />
      default: return null
    }
  }
  const isPublishDisabled = ![1, 2, 3, 4, 5].every(step => validateStep(step))
  return (
    // <CoordinatorLayout>
    // </CoordinatorLayout>

    <div ref={pageRef} className={styles.page}>

      {/* ── Sticky Header ── */}
      <CreateEventStickyHeader isEditing={true} lastUpdated={lastUpdated} />

      {/* ── Header ── */}
      <CreateEventHeader
        title={formData.name?.trim() || 'Sự kiện mới'}
        status={status}
        onPublish={handlePublish}
        onPreview={handlePreview}
        isPublishDisabled={isPublishDisabled}
      />

      {/* ── Body: create sidebar + step content ── */}
      <div className={styles.body}>
        {/* Sentinel element to track when sidebar becomes sticky */}
        <div ref={sentinelRef} className={styles.sidebarSentinel} />

        <NestedSmoothScroll 
            className={`${styles.sidebar} ${isSidebarSticky ? styles.sidebarSticky : ''}`}
            innerClassName={styles.sidebarInner}
        >
          <CreateEventSidebar
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            errorSteps={errorSteps}
            onStepClick={goToStep}
          />
        </NestedSmoothScroll>

        <main className={styles.contentWrapper}>
          <NestedSmoothScroll
            innerRef={contentInnerRef}
            className={`${styles.content} ${isSidebarSticky ? styles.contentSticky : ''}`}
          >
            {renderStep()}
            <div className={styles.extraSpace}></div>
          </NestedSmoothScroll>
        </main>





      </div>

      {/* ── Footer ── */}
      <CreateEventFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onCancel={handleCancel}
        onSaveDraft={onSaveDraft}
        onBack={handleBack}
        onNext={handleNext}
      />

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
        isNotification={confirmModal?.isNotification}
      />
    </div>
  )
}

export default CreateEventPage