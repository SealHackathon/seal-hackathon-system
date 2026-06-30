import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react'
import styles from './CameraCapture.module.css'

const VIDEO_CONSTRAINTS = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'user',
}

/**
 * CameraCapture
 * Props:
 *   onCapture(file)   — gọi khi chụp xong, trả về File object
 *   disabled          — khoá tương tác khi đang loading / success
 *   verifyState       — 'idle' | 'loading' | 'success' | 'error_retry' | 'error_exhausted'
 *                       Dùng để render đúng visual:
 *                         loading → scan animation chạy
 *                         success → corner xanh lá, không scan
 *                         error_*  → ảnh giữ nguyên, không scan
 */
export default function CameraCapture({ onCapture, disabled = false, verifyState = 'idle' }) {
    const webcamRef = useRef(null)

    // 'idle' | 'countdown' | 'loading' | 'preview'
    const [camState, setCamState] = useState('idle')
    const [countdown, setCountdown] = useState(null)
    const [previewSrc, setPreviewSrc] = useState(null)

    // ── Countdown → chụp ────────────────────────────────────────────
    function startCountdown() {
        if (disabled) return
        setCamState('countdown')
        let count = 3
        setCountdown(count)
        const timer = setInterval(() => {
            count -= 1
            if (count === 0) {
                clearInterval(timer)
                capture()
            } else {
                setCountdown(count)
            }
        }, 1000)
    }

    // ── Chụp ảnh ────────────────────────────────────────────────────
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (!imageSrc) return
        setPreviewSrc(imageSrc)
        // Chuyển sang 'loading' — Step2 sẽ set verifyState tương ứng
        setCamState('preview')
        // Convert base64 → File
        fetch(imageSrc)
            .then(r => r.blob())
            .then(blob => {
                const file = new File([blob], 'face.jpg', { type: 'image/jpeg' })
                onCapture?.(file)
            })
    }, [onCapture])

    // ── Chụp lại ────────────────────────────────────────────────────
    function handleRetake() {
        setPreviewSrc(null)
        setCamState('idle')
        onCapture?.(null)
    }

    // ── Derived visual flags ─────────────────────────────────────────
    const isScanning = camState === 'preview' && verifyState === 'loading'
    const isSuccess = camState === 'preview' && verifyState === 'success'
    const isDone = camState === 'preview' && verifyState !== 'loading'

    return (
        <div className={styles.wrapper}>
            <div className={[
                styles.cameraBox,
                isSuccess ? styles.cameraBoxSuccess : '',
            ].filter(Boolean).join(' ')}>

                {/* Corner decorations — xanh lá khi success */}
                <span className={`${styles.corner} ${styles.tl} ${isSuccess ? styles.cornerSuccess : ''}`} />
                <span className={`${styles.corner} ${styles.tr} ${isSuccess ? styles.cornerSuccess : ''}`} />
                <span className={`${styles.corner} ${styles.bl} ${isSuccess ? styles.cornerSuccess : ''}`} />
                <span className={`${styles.corner} ${styles.br} ${isSuccess ? styles.cornerSuccess : ''}`} />

                {/* Feed hoặc Preview */}
                {camState === 'preview' ? (
                    <img src={previewSrc} alt="Ảnh chụp khuôn mặt" className={styles.media} />
                ) : (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={VIDEO_CONSTRAINTS}
                        mirrored
                        className={styles.media}
                    />
                )}

                {/* Đếm ngược — góc trên, không che mặt */}
                {camState === 'countdown' && (
                    <div className={styles.countdownBadge}>
                        <span className={styles.countdownNumber}>{countdown}</span>
                        <span className={styles.countdownLabel}>Chuẩn bị</span>
                    </div>
                )}

                {/* ── LOADING: scan animation + overlay mờ ── */}
                {isScanning && (
                    <div className={styles.scanOverlay}>
                        <div className={styles.scanLine} />
                    </div>
                )}

                {/* ── SUCCESS: badge check ở giữa ── */}
                {/* {isSuccess && (
                    <div className={styles.successBadge}>
                        <CheckCircle size={38} weight="fill" color="var(--color-success, #22c55e)" />
                        <span>Xác minh thành công</span>
                    </div>
                )} */}

                {/* Nút Chụp hình */}
                {camState === 'idle' && !disabled && (
                    <button className={styles.captureBtn} onClick={startCountdown}>
                        <Camera size={24} weight="fill" />
                        Chụp hình
                    </button>
                )}

                {/* Nút Chụp lại — chỉ hiện khi đã có ảnh, không phải loading/success */}
                {isDone && !disabled && (
                    <button className={styles.captureBtn} onClick={handleRetake}>
                        <ArrowCounterClockwise size={24} weight="bold" />
                        Chụp lại
                    </button>
                )}
            </div>
        </div>
    )
}
