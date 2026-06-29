import { useState, useRef, useEffect } from 'react'
import {
    ArrowLeft, ArrowRight,
    CheckCircle, Phone, Warning,
    XSquare
} from '@phosphor-icons/react'
import axiosClient from '../../../api/axiosClient'
import CameraCapture from '../../../components/shared/CameraCapture'
import Banner from '../../../components/shared/Banner'
import Button from '../../../components/shared/Button'
import ProfileStepper from '../../../components/shared/ProfileStepper'
import styles from './Step2FaceVerify.module.css'

// ── Constants ────────────────────────────
const MAX_RETRIES = 3
const RETRY_WAIT_S = 30 * 60   // 30 phút

const TIPS = [
    'Đảm bảo đủ ánh sáng, tránh ngược sáng',
    'Nhìn thẳng vào camera',
    'Đảm bảo khuôn mặt nằm gọn trong khung',
    'Tháo kính nếu đang đeo',
]

function formatCountdown(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `Thử lại sau ${m}:${s}`
}

// 3-dot bounce animation
function Dots() {
    return (
        <span className={styles.dots}>
            <span /><span /><span />
        </span>
    )
}

// ── Component ────────────────────────────
export default function Step2FaceVerify({ onNext, onBack }) {

    // ─ Camera
    const [cameraResetKey, setCameraResetKey] = useState(0)
    const [capturedFile, setCapturedFile] = useState(null)

    // ─ Verify state
    //   'idle' | 'loading' | 'success' | 'error_retry' | 'error_exhausted'
    const [verifyState, setVerifyState] = useState('idle')
    const [retriesLeft, setRetriesLeft] = useState(MAX_RETRIES)

    // ─ Countdown khi hết lượt
    const [countdown, setCountdown] = useState(RETRY_WAIT_S)
    const countdownRef = useRef(null)

    useEffect(() => {
        if (verifyState === 'error_exhausted') {
            setCountdown(RETRY_WAIT_S)
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(countdownRef.current); return 0 }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(countdownRef.current)
    }, [verifyState])

    // ── API call ──────────────────────────
    async function runVerification(file) {
        if (!file) return
        setVerifyState('loading')
        const fd = new FormData()
        fd.append('selfie_img', file)
        try {
            await axiosClient.post('/kyc/face-match', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setTimeout(() => setVerifyState('success'), 1500)
        } catch (err) {
            setVerifyState('error')
        }
    }

    // ── Handlers ────────────────────────
        function handleCapture(file) {
            setCapturedFile(file)
            if (file) runVerification(file)
        }

        // Thử lại — dùng lại ảnh cũ
        function handleRetry() {
            if (capturedFile) runVerification(capturedFile)
        }

        // Chụp ảnh khác — reset camera về idle
        function handleRetake() {
            setCapturedFile(null)
            setCameraResetKey(k => k + 1)
            setVerifyState('idle')
        }

        // ── Derived ─────────────────────────
        const isBusy = verifyState === 'loading'
        const showBanner = verifyState !== 'idle'
        const canProceed = verifyState === 'success' || verifyState === 'error_exhausted'

        return (
            <div className={styles.card}>

                {/* ── Stepper ── */}
                <aside className={styles.sidebar}>
                    <ProfileStepper currentStep={2} />
                </aside>

                {/* ── Content ── */}
                <div className={styles.content}>
                    <h1 className={styles.pageTitle}>Xác minh khuôn mặt</h1>

                    {/* Info banner */}
                    <Banner
                        color="blue" variant="flat"
                        message="Hệ thống sẽ so khớp khuôn mặt của bạn với ảnh trên CCCD để xác nhận danh tính."
                    />

                    {/* Camera + Tips */}
                    <div className={styles.captureRow}>
                        <CameraCapture
                            key={cameraResetKey}
                            onCapture={handleCapture}
                            disabled={isBusy || verifyState === 'success'}
                        />

                        <div className={styles.tipsBox}>
                            <p className={styles.tipsTitle}>Bạn hãy đảm bảo</p>
                            <ul className={styles.tipsList}>
                                {TIPS.map(t => <li key={t}><ArrowRight size='18' color='var(--color-primary-blue)' weight='bold' /> {t}</li>)}
                            </ul>
                        </div>
                    </div>

                    {/* Status banner */}
                    {showBanner && (
                        <section className={styles.section}>

                            {/* Loading */}
                            {verifyState === 'loading' && (
                                <Banner
                                    color="blue"
                                    variant="dashed"
                                    title={<><Dots /> Đang xác minh khuôn mặt</>}
                                    message="Hệ thống đang so khớp khuôn mặt của bạn với ảnh trên CCCD."
                                    badge={`Còn ${retriesLeft} lần thử`}
                                />
                            )}

                            {/* Success */}
                            {verifyState === 'success' && (
                                <Banner
                                    icon={CheckCircle} iconSize={42}
                                    color="green" variant="solid"
                                    title="Xác minh thành công!"
                                    message="Khuôn mặt của bạn khớp với thông tin trên CCCD."
                                />
                            )}


                            {/* Error — còn lượt thử */}
                            {verifyState === 'error_retry' && (
                                <Banner
                                    color="orange" variant="solid"
                                    icon={XSquare}
                                    iconSize={42}
                                    title="Khuôn mặt không khớp"
                                    message={
                                        <>
                                            Không thể xác nhận khuôn mặt của bạn khớp với ảnh trên CCCD.<br />
                                            Vui lòng thực hiện đúng các hướng dẫn trong khung lưu ý bên trên và thử lại.
                                        </>
                                    }
                                    badge={`Còn ${retriesLeft} lần thử`}
                                    buttons={
                                        <div className={styles.errorButtons}>
                                            <Button
                                                label="Thử lại"
                                                color="orange" variant="outline" labelSize={15}
                                                onClick={handleRetry}
                                            />
                                            <Button
                                                label="Chụp ảnh khác"
                                                color="orange" variant="outline" labelSize={15}
                                                onClick={handleRetake}
                                            />
                                        </div>
                                    }
                                />
                            )}

                            {/* Error — hết lượt */}
                            {verifyState === 'error_exhausted' && (
                                <Banner
                                    icon={Warning} iconSize={42}
                                    color="orange" variant="solid"
                                    title="Không thể xác minh khuôn mặt tự động"
                                    message={
                                        <>
                                            Ảnh của bạn sẽ được lưu lại để Ban Tổ Chức xem xét thủ công.<br />
                                            Bạn vẫn có thể tiếp tục hoàn thiện hồ sơ trong lúc chờ kết quả.
                                        </>
                                    }
                                // buttons={
                                //     <Button
                                //         label="Liên hệ BTC"
                                //         color="orange" variant="outline"
                                //         icon={Phone} iconPosition="left" iconSize={18} labelSize={15}
                                //     />
                                // }
                                />
                            )}                    </section>
                    )}

                    {/* Footer */}
                    <div className={styles.footer}>
                        <Button
                            label="Quay lại" variant="outline"
                            icon={ArrowLeft} iconPosition="left" iconSize={20}
                            onClick={onBack}
                        />
                        <Button
                            label="Tiếp tục"
                            icon={ArrowRight} iconPosition="right" iconSize={20}
                            disabled={!canProceed}
                            onClick={() => canProceed && onNext()}
                        />
                    </div>
                </div>
            </div>
        )
    }
