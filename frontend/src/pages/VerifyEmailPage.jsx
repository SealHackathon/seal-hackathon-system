import { useState, useEffect } from 'react'
import { EnvelopeSimple, ArrowCounterClockwise, ArrowLeft } from '@phosphor-icons/react'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/shared/Button'
import styles from './RegisterPage.module.css'

const FAKE_EMAIL = 'ntbi533@gmail.com'
const COOLDOWN = 60

function VerifyEmailPage() {
    const [resendSuccess, setResendSuccess] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown <= 0) return

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])


    function handleResend() {
        console.log('Gửi lại link xác nhận tới:', FAKE_EMAIL)
        setResendSuccess(true)
        setCountdown(COOLDOWN) 
    }

    function formatCountdown(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    function handleChangeEmail() {
        console.log('Quay lại trang đăng ký')
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
                        Link xác nhận đã được gửi đến <strong>{FAKE_EMAIL}</strong>
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
                        icon={ArrowLeft}
                        iconPosition="left"
                        variant="outline"
                        onClick={handleChangeEmail}
                    />

                </div>
            </div>
        </AuthLayout>
    )
}

export default VerifyEmailPage