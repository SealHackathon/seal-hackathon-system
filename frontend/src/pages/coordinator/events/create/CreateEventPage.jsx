import { useState } from 'react'
import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import Step3Prizes from './steps/Step3Prizes'
import Step4Rounds from './steps/Step4Rounds'
import Step6Timeline from './steps/Step6Timeline';
 import { handleSaveDraft } from '../../../../api/handleSaveDraft'
import styles from './CreateEventPage.module.css'
import Step5Categories from './steps/Step5Categories'
import axiosClient from '../../../../api/axiosClient'
import { useNavigate } from 'react-router-dom';
const TOTAL_STEPS = 7

function StepPlaceholder({ step }) {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderText}>Step {step} — Đang phát triển...</p>
    </div>
  )
}

function CreateEventPage() {
  const navigate = useNavigate(); // 1. Khởi tạo hàm điều hướng
  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState([1])
  const [errorSteps, setErrorSteps] = useState([])
  const [formData, setFormData] = useState({
    deadlineSameAsClose: true,
    minMembers: 3,
    maxMembers: 4,
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
      return !!(formData.name?.trim() && formData.openDate && formData.closeDate)
    }
    if (step === 2) {
      const rules = formData.generalRules ?? ''
      const isEmpty = !rules.trim() || rules === '<p></p>' || rules === '<p><br></p>'
      return !isEmpty
    }
    if (step === 3) {
      const mainPrizes = formData.mainPrizes ?? []
      const rankCount = formData.rankCount ?? 3

      // Phải có đủ số giải theo dropdown
      if (mainPrizes.length < rankCount) return false

      // Mỗi giải chính phải điền đủ tên + số lượng + giá trị
      const mainValid = mainPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined
      )
      if (!mainValid) return false

      // Giải phụ nếu có phải điền tên
      const extendedPrizes = formData.extendedPrizes ?? []
      const extValid = extendedPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined
      )
      if (!extValid) return false

      return true
    }
    if (step === 4) {
      const rounds = formData.rounds ?? []
      if (rounds.length === 0) return false
      return rounds.every(r => {
        if (!r.name?.trim()) return false
        if (!r.startDate || !r.endDate) return false

        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        if (end <= start) return false

        if (r.format === 'offline' && !r.location) return false
        if (r.format === 'online' && !r.meetingLink?.trim()) return false

        if (r.submissionType === 'new') {
          if (!r.submissionDeadline) return false
          if (r.submissionOpen) {
            const subOpen = new Date(r.submissionOpen)
            const subDeadline = new Date(r.submissionDeadline)
            if (subDeadline <= subOpen) return false
          }
        }
        return true
      })
    }
    if (step === 5) {
      const categories = formData.categories ?? []
      if (categories.length === 0) return false
      return categories.every(c => c.name?.trim())
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
  function handleNext() {
    // Chỉ validate form client trước khi cho phép bấm nút gửi
    if (!validateStep(currentStep)) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc trước khi tiếp tục!");
      return;
    }

    // Chờ gọi API lưu dữ liệu thành công rồi mới cho phép chuyển bước
    const isSaveSuccess = handleSaveDraft();

    if (isSaveSuccess && currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  }
  // ------------------------------------------------------------------
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }



// Trong component:
function onSaveDraft() {
  return handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange })
}
  //------------------------------------------------------------------------------------------------

  function handlePublish() { setStatus('live'); console.log('Công bố:', formData) }
  function handlePreview() { console.log('Xem trước:', formData) }
  function handleCancel() {
    //todo add vào 1 api xóa hết tất cả những gì nãy giờ lưu nháp
    if (confirm('các thông tin bạn cấu hình sẽ không đc lưu lại !')
    ) {

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
    }


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

  return (
    // <CoordinatorLayout>
    // </CoordinatorLayout>

    <div className={styles.page}>

      {/* ── Header ── */}
      <CreateEventHeader
        title={formData.name?.trim() || 'Sự kiện mới'}
        status={status}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onBack={handleCancel}
      />

      {/* ── Body: create sidebar + step content ── */}
      <div className={styles.body}>

        <aside className={styles.sidebar}>
          <CreateEventSidebar
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            errorSteps={errorSteps}
            onStepClick={goToStep}
          />
        </aside>

        <main className={styles.content}>
          {renderStep()}
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

    </div>
  )
}

export default CreateEventPage