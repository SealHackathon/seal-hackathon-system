import { Check } from '@phosphor-icons/react'
import styles from './ProfileStepper.module.css'

/**
 * ProfileStepper — thanh tiến trình dọc cho luồng Complete Profile
 *
 * @param {number} currentStep  — bước đang active (1-indexed, từ 1 đến 4)
 */

const STEPS = [
    'Xác minh CCCD',
    'Xác minh khuôn mặt',
    'Thông tin sinh viên',
    'Hồ sơ cá nhân',
]

function ProfileStepper({ currentStep }) {
    return (
        <nav className={styles.stepper}>
            {STEPS.map((label, index) => {
                const stepNum = index + 1
                const isDone    = stepNum < currentStep
                const isActive  = stepNum === currentStep

                return (
                    <div
                        key={stepNum}
                        className={[
                            styles.step,
                            isDone   ? styles.done    : '',
                            isActive ? styles.active  : '',
                            !isDone && !isActive ? styles.pending : '',
                        ].join(' ')}
                    >
                        <span className={styles.indicator}>
                            {isDone
                                ? <Check size={14} weight="bold" />
                                : <span className={styles.dash} />
                            }
                        </span>
                        <span className={styles.label}>{label}</span>
                    </div>
                )
            })}
        </nav>
    )
}

export default ProfileStepper
