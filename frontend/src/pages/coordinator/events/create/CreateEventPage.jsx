import { useState } from 'react'
import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import axios from 'axios'
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
    const isSaveSuccess = await handleSaveDraft();

    if (isSaveSuccess && currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  }
// ------------------------------------------------------------------
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }

  //--------------------------------------------------------handleSaveDraft------------------------------------------------------------
  function handleSaveDraft() {
    console.log(`Bắt đầu lưu nháp cho Step ${currentStep}`);

    const token = localStorage.getItem('accessToken');
    const sendData = new FormData();

    // 1. Nếu đã có ID tổng của Event thì mọi step đều phải gửi lên để Backend biết đang chỉnh sửa bản ghi nào
    if (formData.id) {
      sendData.append('id', formData.id);
    }

    // 2. Cấu hình Endpoint và Data Filter theo từng Step cụ thể
    let apiEndpoint = 'http://localhost:8080/api/event'; // Mặc định step 1

    switch (currentStep) {
      case 1:
        // Chỉ gom dữ liệu thuộc Step 1
        sendData.append('name', formData.name || '');
        sendData.append('descriptionDetails', formData.detailDesc || '');
        sendData.append('topic', formData.theme || '');
        sendData.append('description', formData.shortDesc || '');
        sendData.append('minTeamMember', formData.minTeamMember || 1);
        sendData.append('maxTeamMember', formData.maxTeamMember || 5);

        if (formData.openDate) sendData.append('openRegisterTime', new Date(formData.openDate).toISOString());
        if (formData.closeDate) sendData.append('closeRegisterTime', new Date(formData.closeDate).toISOString());
        if (formData.teamDeadline) sendData.append('cofirmTeamTime', new Date(formData.teamDeadline).toISOString());

        if (formData.avatarFile) sendData.append('bannerFile', formData.avatarFile);
        if (formData.coverFile) sendData.append('thumbnailFile', formData.coverFile);
        break;

      case 2:
        // Đổi API Endpoint sang xử lý Luật (Rules) của Step 2
        apiEndpoint = 'http://localhost:8080/api/event/rules';

        // Chỉ nén dữ liệu của Step 2 vào FormData
        sendData.append('rules', formData.rules || '');
        sendData.append('participationBenefits', formData.benefits || '');
        break;

      case 3:
        apiEndpoint = 'http://localhost:8080/api/event/prizes';
        // sendData.append('prizes', ...);
        break;

      // Cứ như vậy cấu hình cho các step 4, 5, 6, 7...
      default:
        break;
    }

    // 3. Thực thi gọi API động
    return axios.post(apiEndpoint, sendData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log(`Lưu bản nháp Step ${currentStep} thành công!`, response.data);

        // Đồng bộ ID trả về (Đặc biệt quan trọng ở Step 1 để lấy ID khai sinh hệ thống)
        if (response.data && response.data.id) {
          handleFormChange('id', response.data.id);
        }
        return true; // Trả về true báo hiệu lưu thành công không lỗi
      })
      .catch(error => {
        console.error(`Lỗi khi gọi API lưu nháp Step ${currentStep}:`, error);
        const errorMsg = error.response?.data?.message || error.response?.data || error.message;
        alert(`Không thể lưu bản nháp Step ${currentStep}: ` + errorMsg);
        return false; // Lưu thất bại
      });
  }
  //------------------------------------------------------------------------------------------------

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
      case 3: return <StepPlaceholder step={3} />
      case 4: return <StepPlaceholder step={4} />
      case 5: return <StepPlaceholder step={5} />
      case 6: return <StepPlaceholder step={6} />
      case 7: return <StepPlaceholder step={7} />
      default: return null
    }
  }

  return (
    <CoordinatorLayout>
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

          <aside className={styles.createSidebar}>
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
    </CoordinatorLayout>
  )
}

export default CreateEventPage