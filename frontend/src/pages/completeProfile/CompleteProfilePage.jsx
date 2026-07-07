import { useState, useEffect } from 'react'
import UserLayout from '../../layouts/UserLayout'
import Step0Intro from './steps/Step0Intro'
import Step1CCCD from './steps/Step1CCCD'
import Step2FaceVerify from './steps/Step2FaceVerify'
import Step3StudentInfo from './steps/Step3StudentInfo'
import Step4PersonalInfo from './steps/Step4PersonalInfo'
import styles from './CompleteProfilePage.module.css'
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../AuthContext'
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

    const navigate = useNavigate();

    // ── Khôi phục step hiện tại từ localStorage ──
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem('completeProfileStep')
        return saved !== null ? parseInt(saved, 10) : 0
    })

    useEffect(() => {
        localStorage.setItem('completeProfileStep', currentStep)
    }, [currentStep])

    const [step1Data, setStep1Data] = useState(() => {
        const saved = localStorage.getItem('completeProfileStep1')
        return saved ? JSON.parse(saved) : null
    })
    useEffect(() => {
        if (step1Data) localStorage.setItem('completeProfileStep1', JSON.stringify(step1Data))
    }, [step1Data])

    const [step2Data, setStep2Data] = useState(() => {
        const saved = localStorage.getItem('completeProfileStep2')
        return saved ? JSON.parse(saved) : null
    })
    useEffect(() => {
        if (step2Data) localStorage.setItem('completeProfileStep2', JSON.stringify(step2Data))
    }, [step2Data])
   
    const [step3Data, setStep3Data] = useState(() => {
        const saved = localStorage.getItem('completeProfileStep3')
        return saved ? JSON.parse(saved) : null
    })
    useEffect(() => {
        if (step3Data) localStorage.setItem('completeProfileStep3', JSON.stringify(step3Data))
    }, [step3Data])

    const [step4Data, setStep4Data] = useState(() => {
        const saved = localStorage.getItem('completeProfileStep4')
        return saved ? JSON.parse(saved) : null
    })
    useEffect(() => {
        if (step4Data) localStorage.setItem('completeProfileStep4', JSON.stringify(step4Data))
    }, [step4Data])

    const goNext = () => setCurrentStep(s => s + 1)
    const goBack = () => setCurrentStep(s => s - 1)

    const { updateUserStatus } = useAuth();

    async function handleStep4Submit(data) {
        setStep4Data(data); // save state
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

            // Xoá trạng thái lưu data và step vì đã hoàn thành
            localStorage.removeItem('completeProfileStep');
            localStorage.removeItem('completeProfileStep1');
            localStorage.removeItem('completeProfileStep2');
            localStorage.removeItem('completeProfileStep3');
            localStorage.removeItem('completeProfileStep4');

            // Logic chuyển trang hoặc thông báo thành công tại đây...
            updateUserStatus(response.data.status || response.status);
            navigate("/user/dashboard")
        } catch (error) {
            console.error('[CompleteProfile] Submit Failed:', error.response?.data || error.message);
            // Alert hoặc Toast thông báo lỗi từ Spring Boot (ví dụ: "Tiểu sử tối đa 300 ký tự")
        }
    }

    return (
        <UserLayout showCard={false}>
            <div className={styles.pageWrapper}>

                {currentStep === 0 && (
                    <Step0Intro onStart={goNext} />
                )}

                {currentStep === 1 && (
                    <Step1CCCD
                        onNext={goNext}
                        onBack={goBack}
                        initialData={step1Data}
                        onSaveData={setStep1Data}
                    />
                )}

                {currentStep === 2 && (
                    <Step2FaceVerify
                        onNext={goNext}
                        onBack={goBack}
                        initialData={step2Data}
                        onSaveData={setStep2Data}
                    />
                )}

                {currentStep === 3 && (
                    <Step3StudentInfo
                        onNext={goNext}
                        onBack={goBack}
                        initialData={step3Data}
                        onSaveData={setStep3Data}
                    />
                )}

                {currentStep === 4 && (
                    <Step4PersonalInfo
                        onBack={goBack}
                        onSubmit={handleStep4Submit}
                        initialData={step4Data}
                        onSaveData={setStep4Data}
                    />
                )}
            </div>
        </UserLayout>
    )
}

export default CompleteProfilePage
