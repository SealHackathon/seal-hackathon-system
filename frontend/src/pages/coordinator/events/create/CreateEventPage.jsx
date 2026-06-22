import { useState } from 'react'
import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import Step3Prizes from './steps/Step3Prizes'
import Step4Rounds from './steps/Step4Rounds'
import axios from 'axios'
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

  //--------------------------------------------------------handleSaveDraft------------------------------------------------------------
  function handleSaveDraft() {
    console.log(`Bắt đầu lưu nháp cho Step ${currentStep}`);

    const sendData = new FormData();

    // 1. Nếu đã có ID tổng của Event thì mọi step đều phải gửi lên để Backend biết đang chỉnh sửa bản ghi nào
    if (formData.id) {
      sendData.append('id', formData.id);
    }

    // 2. Cấu hình Endpoint và Data Filter theo từng Step cụ thể
    let apiEndpoint = '/event'; // Mặc định step 1

    switch (currentStep) {
      case 1: {
        // Chỉ gom dữ liệu thuộc Step 1
        sendData.append('name', formData.name || '');
        sendData.append('descriptionDetails', formData.detailDesc || '');
        sendData.append('topic', formData.theme || '');
        sendData.append('description', formData.shortDesc || '');
        sendData.append('minTeamMember', formData.minMembers || 1);
        sendData.append('maxTeamMember', formData.maxMembers || 5);

        if (formData.openDate) sendData.append('openRegisterTime', new Date(formData.openDate).toISOString());
        if (formData.closeDate) sendData.append('closeRegisterTime', new Date(formData.closeDate).toISOString());
        if (formData.teamDeadline) sendData.append('cofirmTeamTime', new Date(formData.teamDeadline).toISOString());

        if (formData.avatarFile) sendData.append('bannerFile', formData.avatarFile);
        if (formData.coverFile) sendData.append('thumbnailFile', formData.coverFile);

        // Gọi API lưu thông tin cơ bản (Multipart FormData)
        return axiosClient.post(apiEndpoint, sendData)
          .then(response => {
            console.log(`Lưu bản nháp Step ${currentStep} thành công!`, response.data);

            // Đồng bộ ID tổng trả về từ Backend vào state
            if (response.data && response.data.id) {
              handleFormChange('id', response.data.id);
            }
            return true;
          })
          .catch(error => {
            console.error(`Lỗi khi gọi API lưu nháp Step ${currentStep}:`, error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert(`Không thể lưu bản nháp Step ${currentStep}: ` + errorMsg);
            return false;
          });
      }
      case 2:
        {
          // 1. Đổi API Endpoint sang xử lý Luật và Lưu ý của Step 2
          apiEndpoint = '/event-notes';

          // 2. Khai báo Payload JSON gom cụm thông tin của Step 2
          // Cấu trúc này mapping 100% với EventNoteRequest ở Backend
          const step2Payload = {
            eventId: formData.id,            // ID tổng lấy được từ Step 1 thành công
            eventRules: formData.generalRules || '',
            notes: formData.notes || []      // Mảng các lưu ý, ví dụ: [{title: '...', description: '...'}]
          };


          // 3. Gọi API lưu Luật & Ghi chú (JSON dữ liệu thuần)
          return axiosClient.post(apiEndpoint, step2Payload)
            .then(response => {
              console.log(`Lưu bản nháp Step 2 thành công!`, response.data);
              return true;
            })
            .catch(error => {
              console.error(`Lỗi khi gọi API lưu nháp Step 2:`, error);
              const errorMsg = error.response?.data?.message || error.response?.data || error.message;
              alert(`Không thể lưu bản nháp Step 2: ` + errorMsg);
              return false;
            });

          // Cứ như vậy cấu hình cho các step 3, 4, 5, 6, 7...
        }

      case 3:
        {
          // 1. Đổi API Endpoint sang xử lý Luật và Lưu ý của Step 2
          apiEndpoint = '/prize';

          console.log(formData.extendedPrizes.length);
          // 2. Map mảng giải chính từ state và đóng dấu nhãn 'MAIN'
          const mappedMain = (formData.mainPrizes || []).map(item => ({
            prizeName: item.name?.trim() || item.defaultName || 'Giải thưởng',
            description: item.desc?.trim() || '',
            money: Number(item.cash) || 0,
            quantity: Number(item.quantity) || 1,
            prizeType: 'MAIN' // Đánh dấu đây là giải cố định (Hạng 1, 2, 3...)
          }));

          // 3. Map mảng giải phụ (Kéo thả) từ state và đóng dấu nhãn 'EXTENDED'
          const mappedExtended = (formData.extendedPrizes || []).map(item => ({
            prizeName: item.name?.trim() || 'Giải phụ',
            description: item.desc?.trim() || '',
            money: Number(item.cash) || 0,
            quantity: Number(item.quantity) || 1,
            prizeType: 'EXTENDED' // Đánh dấu đây là giải tự thêm ngoài danh sách
          }));

          // 4. Gộp 2 mảng đã được "dán nhãn" thành 1 mảng phẳng duy nhất để map khớp với DTO ở Backend
          const step3Payload = {
            eventId: formData.id, // ID tổng sinh ra từ Step 1
            participationBenefits: formData.benefits,
            prizes: [...mappedMain, ...mappedExtended]
          };


          // 5. Gọi API lưu giải thưởng dưới dạng JSON thuần túy
          return axiosClient.post(apiEndpoint, step3Payload)
            .then(response => {
              console.log(`Lưu bản nháp Step 3 thành công!`, response.data);
              return true; // Trả về bộ trigger báo hiệu lưu thành công để chuyển step
            })
            .catch(error => {
              console.error(`Lỗi khi gọi API lưu nháp Step 3:`, error);
              const errorMsg = error.response?.data?.message || error.response?.data || error.message;
              alert(`Không thể lưu bản nháp Step 3: ` + errorMsg);
              return false; // Lưu thất bại, giữ nguyên giao diện để kiểm tra dữ liệu
            });

          // Cứ như vậy cấu hình cho các step 3, 4, 5, 6, 7...
        }

      case 4: {
        apiEndpoint = '/round';

        const step4Payload = {
          
          eventId: formData.id,
          rounds: (formData.rounds || []).map((item, index) => ({
            name: item.name?.trim() || 'Vòng thi mới',
            timeStart: item.startDate ? new Date(item.startDate).toISOString() : null,
            timeEnd: item.endDate ? new Date(item.endDate).toISOString() : null,
            hasPresetiontation: false,           // FE chưa có field này, mặc định false
            topTeamPass: Number(item.topTeamPass) || 0,
            ordinal_number: index + 1,
            submissionDeadline: item.submissionDeadline
              ? new Date(item.submissionDeadline).toISOString()
              : null,
            position: item.format === 'offline'
              ? (item.location?.name || item.location?.formatted_address || '')
              : (item.meetingLink || ''),
            rubricId: Number(item.rubricId) || 0,

            // Chỉ gửi submissionConfig khi người dùng chọn nộp bài mới
            submissionConfig: item.submissionType === 'new'
              ? {
                title: item.name?.trim() || '',
                submissionInstructions: item.submissionGuide || '',
                openingTime: item.submissionOpen
                  ? new Date(item.submissionOpen).toISOString()
                  : null,
                submissionDeadline: item.submissionDeadline
                  ? new Date(item.submissionDeadline).toISOString()
                  : null,
                hasSubmission: true,
              }
              : {
                // submissionType === 'previous': không yêu cầu nộp bài mới
                title: '',
                submissionInstructions: '',
                openingTime: null,
                submissionDeadline: null,
                hasSubmission: false,
              },

            // Map agenda → timelines
            
            timelines: (item.agenda || []).map(t => ({
              
              
              name: t.name?.trim() || '',
              description: t.desc?.trim() || '',
              timeStart: t.startTime ,
              timeEnd: t.timeEnd ? new Date(t.timeEnd).toISOString() : null,
            })),
          })),
        };

        return axiosClient.post(apiEndpoint, step4Payload)
          .then(response => {
            console.log('Lưu bản nháp Step 4 thành công!', response.data);
            return true;
          })
          .catch(error => {
            console.error('Lỗi khi gọi API lưu nháp Step 4:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert('Không thể lưu bản nháp Step 4: ' + errorMsg);
            return false;
          });
      }

      case 5: { // Bọc khối scope bằng dấu ngoặc nhọn tránh lỗi Unexpected Lexical
        // 1. Định nghĩa API Endpoint cho các bảng đấu của Step 5
        apiEndpoint = '/track';

        // 2. Lấy đúng mảng `categories` từ trong formData (nếu trống thì tạo mảng rỗng)
        const rawCategories = formData.categories || [];

        // 3. Map chính xác sang cấu trúc DTO TrackRequest.java ở Backend
        const step5Payload = {
          eventId: formData.id, // ID tổng xuyên suốt từ Step 1
          tracks: rawCategories.map(item => ({
            name: item.name?.trim() || 'Bảng đấu mới',          // Map trúng sang private String name;
            des: item.desc?.trim() || '',                       // Map trúng sang private String des;
            minTeamPerTrack: 1,                                 // Mặc định tối thiểu là 1 đội
            maxTeamPerTrack: Number(item.teamLimit) || 10       // Map item.teamLimit trúng sang private int maxTeamPerTrack;
          }))
        };
        // 4. Thực hiện gọi API gửi chuỗi JSON lên Spring Boot
        return axios.post(apiEndpoint, step5Payload)
          .then(response => {
            console.log(`Lưu bản nháp Step 5 thành công!`, response.data);
            return true; // Trả về true để kích hoạt luồng chuyển sang Step 6
          })
          .catch(error => {
            console.error(`Lỗi khi gọi API lưu nháp Step 5:`, error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert(`Không thể lưu bản nháp Step 5: ` + errorMsg);
            return false; // Thất bại, giữ nguyên giao diện ở Step 5 để kiểm tra
          });
      }
      default:
        break;
    }


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
        onSaveDraft={handleSaveDraft}
        onBack={handleBack}
        onNext={handleNext}
      />

    </div>
  )
}

export default CreateEventPage