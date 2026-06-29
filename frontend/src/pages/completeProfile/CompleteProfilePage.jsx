import { useState } from 'react'
// import UserLayout        from '../../layouts/UserLayout'
import Step0Intro from './steps/Step0Intro'
import Step1CCCD from './steps/Step1CCCD'
import Step2FaceVerify from './steps/Step2FaceVerify'
import Step3StudentInfo from './steps/Step3StudentInfo'
import Step4PersonalInfo from './steps/Step4PersonalInfo'
import styles from './CompleteProfilePage.module.css'
import axiosClient from '../../api/axiosClient';

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

    async function handleStep4Submit(data) {
        const formData = new FormData();

        // 1. Append file avatar tách riêng
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        // 2. Đóng gói các data text/object/array
        const profileData = {
            bio: data.bio || '',
            cvLink: data.cvLink || '',
            positons: data.positions || [],
            techTags: data.techTags || {},
            topics: data.topics || []
        };

        formData.append(
            'data',
            new Blob([JSON.stringify(profileData)], { type: 'application/json' })
        );

        try {
            console.log('[CompleteProfile] Submitting via custom axiosClient...');

            const response = await axiosClient.put('/user/student-profile', formData, {
                headers: {
                
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('[CompleteProfile] Submitted Success:', response.data);
            // Logic chuyển trang hoặc thông báo thành công tại đây...

        } catch (error) {
            console.error('[CompleteProfile] Submit Failed:', error.response?.data || error.message);
            // Alert hoặc Toast thông báo lỗi từ Spring Boot (ví dụ: "Tiểu sử tối đa 300 ký tự")
        }
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
