import { useState } from 'react'
import UserLayout from '../../layouts/UserLayout'
import Step0Intro from './steps/Step0Intro'
// import Step1CCCD        from './steps/Step1CCCD'      
// import Step2FaceVerify  from './steps/Step2FaceVerify' 
// import Step3StudentInfo from './steps/Step3StudentInfo'
// import Step4Profile     from './steps/Step4Profile'    
import styles from './CompleteProfilePage.module.css'

function CompleteProfilePage() {
    const [currentStep, setCurrentStep] = useState(0)

    const handleNext = () => setCurrentStep(prev => prev + 1)
    const handleBack = () => setCurrentStep(prev => prev - 1)

    return (
        <UserLayout showCard={false}>
            <div className={styles.pageWrapper}>
                {currentStep === 0 && (
                    <Step0Intro onStart={handleNext} />
                )}

                {/* Steps 1-4 */}
                {/* {currentStep === 1 && <Step1CCCD       onNext={handleNext} onBack={handleBack} />} */}
                {/* {currentStep === 2 && <Step2FaceVerify  onNext={handleNext} onBack={handleBack} />} */}
                {/* {currentStep === 3 && <Step3StudentInfo onNext={handleNext} onBack={handleBack} />} */}
                {/* {currentStep === 4 && <Step4Profile     onNext={handleNext} onBack={handleBack} />} */}
            </div>
        </UserLayout>
    )
}

export default CompleteProfilePage
