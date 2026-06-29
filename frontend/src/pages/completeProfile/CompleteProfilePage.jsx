import { useState } from 'react'
// import UserLayout        from '../../layouts/UserLayout'
import Step0Intro from './steps/Step0Intro'
import Step1CCCD from './steps/Step1CCCD'
import Step2FaceVerify from './steps/Step2FaceVerify'
import Step3StudentInfo from './steps/Step3StudentInfo'
import Step4PersonalInfo from './steps/Step4PersonalInfo'
import styles from './CompleteProfilePage.module.css'

/**
 * CompleteProfilePage — điều phối toàn bộ luồng hoàn thiện hồ sơ
 *
 *  Bước 0: Trang giới thiệu (Step0Intro)
 *  Bước 1: Xác minh CCCD      (Step1CCCD)
 *  Bước 2: Xác minh khuôn mặt (Step2FaceVerify)
 *  Bước 3: Thông tin sinh viên (Step3StudentInfo)
 *  Bước 4: Hồ sơ cá nhân      (Step4PersonalInfo)
 */
function CompleteProfilePage() {
    const [currentStep, setCurrentStep] = useState(0)

    const goNext = () => setCurrentStep(s => s + 1)
    const goBack = () => setCurrentStep(s => s - 1)

    function handleStep4Submit(data) {
        // TODO: gọi API submit toàn bộ profile
        console.log('[CompleteProfile] Submitted:', data)
    }

    return (
        <div className={styles.pageWrapper}>

            {currentStep === 0 && (
                <Step0Intro onStart={goNext} />
            )}

            {currentStep === 1 && (
                <Step1CCCD
                    onNext={goNext}
                    onBack={goBack}
                />
            )}

            {currentStep === 2 && (
                <Step2FaceVerify
                    onNext={goNext}
                    onBack={goBack}
                />
            )}

            {currentStep === 3 && (
                <Step3StudentInfo
                    onNext={goNext}
                    onBack={goBack}
                />
            )}

            {currentStep === 4 && (
                <Step4PersonalInfo
                    onBack={goBack}
                    onSubmit={handleStep4Submit}
                />
            )}

        </div>
    )
}

export default CompleteProfilePage
