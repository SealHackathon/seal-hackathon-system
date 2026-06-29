import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, ArrowCounterClockwise } from '@phosphor-icons/react'
import styles from './CameraCapture.module.css'

const VIDEO_CONSTRAINTS = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'user',
}

/**
 * CameraCapture
 * Props:
 *   onCapture(file)  — gọi khi chụp xong, trả về File object
 *   onRetake()       — gọi khi user bấm "Chụp lại" (internal button)
 *   disabled         — khoá tương tác khi đang loading / success
 */
export default function CameraCapture({ onCapture, disabled = false }) {
    const webcamRef = useRef(null)

    // 'idle' | 'countdown' | 'preview'
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

    return (
        <div className={styles.wrapper}>
            <div className={styles.cameraBox}>

                {/* Corner decorations */}
                <span className={`${styles.corner} ${styles.tl}`} />
                <span className={`${styles.corner} ${styles.tr}`} />
                <span className={`${styles.corner} ${styles.bl}`} />
                <span className={`${styles.corner} ${styles.br}`} />

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

                {/* Scanning overlay — chỉ hiện sau khi chụp */}
                {camState === 'preview' && (
                    <div className={styles.scanOverlay}>
                        <div className={styles.scanLine} />
                    </div>
                )}

                {/* Nút Chụp hình */}
                {camState === 'idle' && !disabled && (
                    <button className={styles.captureBtn} onClick={startCountdown}>
                        <Camera size={24} weight="fill" />
                        Chụp hình
                    </button>
                )}

                {/* Nút Chụp lại */}
                {camState === 'preview' && !disabled && (
                    <button className={styles.captureBtn} onClick={handleRetake}>
                        <ArrowCounterClockwise size={24} weight="bold" />
                        Chụp lại
                    </button>
                )}
            </div>
        </div>
    )
}
