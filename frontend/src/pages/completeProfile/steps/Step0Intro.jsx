import {
    UserCheck,
    IdentificationCard,
    Camera,
    GraduationCap,
    UserCircleGear,
    Lock,
    ArrowRight,
} from '@phosphor-icons/react'
import Banner from '../../../components/shared/Banner'
import Button from '../../../components/shared/Button'
import styles from './Step0Intro.module.css'

const STEPS = [
    {
        number: 1,
        Icon: IdentificationCard,
        title: 'Xác minh CCCD',
        prepare: 'Ảnh chụp mặt trước và mặt sau CCCD',
    },
    {
        number: 2,
        Icon: Camera,
        title: 'Xác minh khuôn mặt',
        prepare: 'Webcam hoặc camera điện thoại để chụp selfie',
    },
    {
        number: 3,
        Icon: GraduationCap,
        title: 'Thông tin sinh viên',
        prepare: 'Thẻ sinh viên và mã số sinh viên',
    },
    {
        number: 4,
        Icon: UserCircleGear,
        title: 'Hồ sơ cá nhân',
        prepare: null,
    },
]

function Step0Intro({ onStart }) {
    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <UserCheck size={28} weight="bold" className={styles.headerIcon} />
                <h1 className={styles.title}>Hoàn thiện thông tin</h1>
            </div>
            <p className={styles.subtitle}>
                Hoàn thiện đầy đủ và chính xác thông tin để giúp quá trình
                xác thực thông tin diễn ra nhanh hơn bạn nhé.
            </p>

            <div className={styles.stepsContainer}>
                {/* Section label */}
                <p className={styles.sectionLabel}>Các bước bạn sẽ thực hiện</p>

                {/* Step list */}
                <div className={styles.stepList}>
                    {STEPS.map((step, index) => (
                        <div key={step.number} className={styles.stepItem}>
                            {/* Icon column */}
                            <div className={styles.iconCol}>
                                <div className={styles.iconCircle}>
                                    <step.Icon size={24} weight="fill" color="white" />
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={styles.connector} />
                                )}
                            </div>

                            {/* Text column */}
                            <div className={styles.content}>
                                <p className={styles.stepTitle}>
                                    {step.number}. {step.title}
                                </p>
                                {step.prepare && (
                                    <p className={styles.prepare}>
                                        Cần chuẩn bị: {step.prepare}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Privacy note */}
            <Banner
                icon={Lock}
                iconSize={42}
                color="blue"
                variant="dashed"
                message="Ban tổ chức cam kết chỉ sử dụng các thông tin trên cho mục đích xác minh danh tính người tham dự. Mọi dữ liệu cá nhân được bảo mật và không chia sẻ với bên thứ ba."
            />

            {/* Footer */}
            <div className={styles.footer}>
                <Button
                    className={styles.btn}
                    label="Bắt đầu"
                    icon={ArrowRight}
                    iconPosition="right"
                    iconSize={24}
                    onClick={onStart}
                />
            </div>
        </div>
    )
}

export default Step0Intro
