import { useState } from 'react'
import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import Step3Prizes from './steps/Step3Prizes'
import Step4Rounds from './steps/Step4Rounds'

import Step5Categories from './steps/Step5Categories'

import styles from './CreateEventPage.module.css'

const TOTAL_STEPS = 7

function StepPlaceholder({ step }) {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderText}>Step {step} — Đang phát triển...</p>
    </div>
  )
}

function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState([1])
  const [errorSteps, setErrorSteps] = useState([])
  const [formData, setFormData] = useState({
    deadlineSameAsClose: true,
  })
  const [status, setStatus] = useState('draft')

  function handleFormChange(field, val) {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

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

  function handleNext() { if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1) }
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }
  function handleSaveDraft() { console.log('Lưu nháp:', formData) }
  function handlePublish() { setStatus('live'); console.log('Công bố:', formData) }
  function handlePreview() { console.log('Xem trước:', formData) }
  function handleCancel() {
    if (confirm('Huỷ tạo sự kiện? Các thay đổi chưa lưu sẽ bị mất.'))
      window.history.back()
  }

  function renderStep() {
    switch (currentStep) {
      case 1: return <Step1BasicInfo formData={formData} onFormChange={handleFormChange} />
      case 2: return <Step2Rules formData={formData} onFormChange={handleFormChange} />  // ← thêm
      case 3: return <Step3Prizes formData={formData} onFormChange={handleFormChange} />
      case 4: return <Step4Rounds formData={formData} onChange={setFormData} />
    

      case 5: return <Step5Categories formData={formData} onFormChange={handleFormChange} />
      case 6: return <StepPlaceholder step={6} />
      case 7: return <StepPlaceholder step={7} />
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
          onSaveDraft={handleSaveDraft}
          onBack={handleBack}
          onNext={handleNext}
        />

      </div>
    
  
)
}

export default CreateEventPage