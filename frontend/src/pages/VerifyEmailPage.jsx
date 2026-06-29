import { useState, useEffect } from 'react'
import { EnvelopeSimple, ArrowCounterClockwise, ArrowLeft } from '@phosphor-icons/react'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/shared/Button'
import ModalShell from '../components/shared/ModalShell'
import FormInput from '../components/shared/FormInput'
import styles from './RegisterPage.module.css'

const FAKE_EMAIL = localStorage.getItem('verifyEmail');
const COOLDOWN = 60

function VerifyEmailPage() {
    // Read the email from localStorage that was saved during registration
    const initialEmail = localStorage.getItem('verifyEmail') || 'ntbi533@gmail.com'
    const [currentEmail, setCurrentEmail] = useState(initialEmail)

    const [resendSuccess, setResendSuccess] = useState(false)
    const [countdown, setCountdown] = useState(0)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newEmail, setNewEmail] = useState('')

    useEffect(() => {
        if (countdown <= 0) return

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])


    function handleResend() {
        console.log('Gửi lại link xác nhận tới:', currentEmail)
        setResendSuccess(true)
        setCountdown(COOLDOWN)
    }

    function formatCountdown(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    function handleChangeEmail() {
        setIsModalOpen(true)
    }

    function handleConfirmChangeEmail() {
        console.log('Gọi API đổi email pending thành:', newEmail)
        
        // TODO: Call API PUT /api/auth/change-pending-email here.
        // Assuming API call is successful:
        
        // 1. Update localStorage
        localStorage.setItem('verifyEmail', newEmail)
        
        // Also update registerData if it exists
        const registerDataStr = localStorage.getItem('registerData')
        if (registerDataStr) {
            try {
                const registerData = JSON.parse(registerDataStr)
                registerData.email = newEmail
                localStorage.setItem('registerData', JSON.stringify(registerData))
            } catch (e) {
                console.error("Error parsing registerData from localStorage", e)
            }
        }

        // 2. Update state to reflect on UI immediately
        setCurrentEmail(newEmail)

        // 3. Reset and close modal
        setIsModalOpen(false)
        setNewEmail('')
    }

    return (
        <AuthLayout>
            <div className={styles.wrapper}>
                <h1 className={`${styles.title} ${'icon-label'}`}>
                    <EnvelopeSimple size={36} />
                    Xác nhận địa chỉ email
                </h1>

                <hr className={styles.divider} />

                <div className={styles.form}>

                    <p className={styles.verifyText}>
                        Link xác nhận đã được gửi đến <strong>{currentEmail}</strong>
                    </p>

                    <p className={styles.verifyText}>
                        Bạn hãy <strong>nhấn vào liên kết trong email</strong> để hoàn tất quá trình đăng ký.
                        Nếu không nhận được mail, bạn thử <strong>kiểm tra hộp thư rác (spam)</strong> nhé.
                    </p>

                    <p className={styles.verifyText}>
                        Lưu ý, liên kết này sẽ hết hạn trong vòng <strong>2 phút</strong>.
                    </p>

                    <div className={styles.resendWrapper}>
                        <div className={styles.orMessage}>
                            <span>Bạn vẫn chưa xác nhận được mã xác nhận?</span>
                        </div>

                        <Button
                            label={countdown > 0 ? `Gửi lại sau ${formatCountdown(countdown)}` : 'Gửi lại Link xác nhận'}
                            icon={ArrowCounterClockwise}
                            iconPosition="right"
                            variant="primary"
                            disabled={countdown > 0}   // ← xám trong 2 phút
                            onClick={handleResend}
                        />

                        {resendSuccess && (
                            <p className={styles.resendSuccess}>Đã gửi lại link xác nhận!</p>
                        )}
                    </div>

                    <div className={styles.orRow}>
                        <hr /><span>Hoặc</span><hr />
                    </div>

                    <Button
                        label="Đổi địa chỉ email"
                        variant="outline"
                        onClick={handleChangeEmail}
                    />

                </div>
            </div>

            {isModalOpen && (
                <ModalShell
                    onClose={() => setIsModalOpen(false)}
                    size="md"
                    footer={
                        <div className={styles.modalFooter}>
                            <Button
                                label="Huỷ"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            />
                            <Button
                                label="Cập nhật"
                                variant="primary"
                                onClick={handleConfirmChangeEmail}
                                disabled={!newEmail}
                            />
                        </div>
                    }
                >
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>
                            Đổi địa chỉ email
                        </h2>
                        <FormInput
                            label="Email mới"
                            placeholder="Nhập địa chỉ email mới"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                </ModalShell>
            )}
        </AuthLayout>
    )
}

export default VerifyEmailPage