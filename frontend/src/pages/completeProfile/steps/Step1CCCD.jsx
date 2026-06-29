import { useState, useEffect, useRef } from 'react'
import {
    ArrowLeft, ArrowRight,
    CheckCircle, Phone,
    XSquare, ArrowsClockwise, UploadSimple
} from '@phosphor-icons/react'
import axiosClient from '../../../api/axiosClient'
import FileUpload from '../../../components/shared/FileUpload'
import Banner from '../../../components/shared/Banner'
import Button from '../../../components/shared/Button'
import FormInput from '../../../components/shared/FormInput'
import Dropdown from '../../../components/shared/Dropdown'
import DateTimePicker from '../../../components/shared/DateTimePicker'
import ProfileStepper from '../../../components/shared/ProfileStepper'
import styles from './Step1CCCD.module.css'

// ── Constants ────────────────────────────
const MAX_RETRIES = 3
const RETRY_WAIT_S = 30 * 60   // 30 phút

const GENDER_OPTIONS = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' },
]

const EMPTY_FORM = {
    fullName: '',
    cmnd: '',
    dateOfBirth: null,   // Date object cho DateTimePicker
    gender: '',
    hometown: '',
    thuongtru: '',
}

/**
 * Parse chuỗi ngày từ API → Date object cho DateTimePicker.
 * API có thể trả về nhiều định dạng: "dd/MM/yyyy", ISO string, v.v.
 */
function parseApiDate(str) {
    if (!str) return null
    // Thử parse ISO trước (VD: "2005-10-19T00:00:00.000Z")
    const iso = new Date(str)
    if (!isNaN(iso)) return iso
    // Parse "dd/MM/yyyy"
    const parts = str.split('/')
    if (parts.length === 3) {
        const [d, m, y] = parts.map(Number)
        return new Date(y, m - 1, d)
    }
    return null
}

function formatCountdown(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `Thử lại sau ${m}:${s}`
}

// ── Component ────────────────────────────
function Step1CCCD({ onNext, onBack }) {

    // ─ Files
    const [frontFile, setFrontFile] = useState(null)
    const [backFile, setBackFile] = useState(null)
    const [fileResetKey, setFileResetKey] = useState(0)

    // ─ Extraction state
    //   'idle' | 'loading' | 'success' | 'error_retry' | 'error_exhausted'
    const [extractionState, setExtractionState] = useState('idle')
    const [retriesLeft, setRetriesLeft] = useState(MAX_RETRIES)

    // ─ Editable form — pre-populate sau khi OCR xong
    const [formData, setFormData] = useState(EMPTY_FORM)

    // ─ Countdown khi hết lượt
    const [countdown, setCountdown] = useState(RETRY_WAIT_S)
    const countdownRef = useRef(null)

    // ─ Checkbox xác nhận
    const [confirmed, setConfirmed] = useState(false)

    // Auto-trigger khi đủ cả 2 file và đang idle
    useEffect(() => {
        if (frontFile && backFile && extractionState === 'idle') {
            runExtraction(frontFile, backFile)
        }
    }, [frontFile, backFile, extractionState])

    // Countdown khi bước vào error_exhausted
    useEffect(() => {
        if (extractionState === 'error_exhausted') {
            setCountdown(RETRY_WAIT_S)
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(countdownRef.current); return 0 }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(countdownRef.current)
    }, [extractionState])

    // ─ API call ───────────────────────────
    async function runExtraction(front, back) {
        // TODO: Gọi API trích xuất thông tin CCCD ở đây
    }

    // ─ Handlers ──────────────────────────
    function handleRetry() {
        // Giữ nguyên file, gọi lại API
        setExtractionState('idle')
    }

    function handleReplaceFiles() {
        // Xóa file, remount cả 2 FileUpload
        setFrontFile(null)
        setBackFile(null)
        setFileResetKey(k => k + 1)
        setExtractionState('idle')
        setFormData(EMPTY_FORM)
        setConfirmed(false)
    }

    function handleFrontChange(file) {
        setFrontFile(file)
        resetExtractionIfNeeded()
    }

    function handleBackChange(file) {
        setBackFile(file)
        resetExtractionIfNeeded()
    }

    function resetExtractionIfNeeded() {
        // Tránh vòng lặp: chỉ reset khi không còn ở idle
        setExtractionState(prev => prev !== 'idle' ? 'idle' : prev)
        setFormData(EMPTY_FORM)
        setConfirmed(false)
    }

    function setField(key, val) {
        setFormData(prev => ({ ...prev, [key]: val }))
    }

    // ─ Derived ──────────────────────────
    const formComplete =
        formData.fullName.trim() &&
        formData.cmnd.trim() &&
        formData.dateOfBirth &&
        formData.gender &&
        formData.hometown.trim() &&
        formData.thuongtru.trim()

    const canProceed = extractionState === 'success' && formComplete && confirmed
    const showExtractionSection = extractionState !== 'idle'

    return (
        <div className={styles.card}>

            {/* ── Stepper ── */}
            <aside className={styles.sidebar}>
                <ProfileStepper currentStep={1} />
            </aside>

            {/* ── Content ── */}
            <div className={styles.content}>
                <h1 className={styles.pageTitle}>Xác minh CCCD</h1>

                {/* ===== Section: Ảnh CCCD ===== */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Ảnh CCCD</h2>

                    <Banner
                        color="blue" variant="flat"
                        message="Tải lên ảnh CCCD để hệ thống tự điền thông tin. Bạn có thể chỉnh sửa sau khi trích xuất."
                    />

                    <div className={styles.uploadRow}>
                        <FileUpload
                            key={`front-${fileResetKey}`}
                            label="Mặt trước CCCD" required
                            accept={['image/png', 'image/jpeg', 'image/jpg']}
                            maxSizeMB={5}
                            aspectRatio={3 / 2}
                            onFileChange={handleFrontChange}
                        />
                        <FileUpload
                            key={`back-${fileResetKey}`}
                            label="Mặt sau CCCD" required
                            accept={['image/png', 'image/jpeg', 'image/jpg']}
                            maxSizeMB={5}
                            aspectRatio={3 / 2}
                            onFileChange={handleBackChange}
                        />
                    </div>
                </section>

                {/* ===== Section: Thông tin trích xuất ===== */}
                {showExtractionSection && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Thông tin trích xuất từ CCCD</h2>

                        {/* Loading */}
                        {extractionState === 'loading' && (
                            <Banner
                                color="blue" variant="dashed"
                                title={
                                    <>
                                        Đang phân tích CCCD của bạn
                                        <span className={styles.dots}>
                                            <span /><span /><span />
                                        </span>
                                    </>
                                }
                                message="Quá trình này có thể mất vài giây, vui lòng không tắt trang."
                                badge={`Còn ${retriesLeft} lần thử`}
                            />
                        )}

                        {/* Error — còn lượt */}
                        {extractionState === 'error_retry' && (
                            <Banner
                                color="orange" variant="solid"
                                title="Không thể đọc thông tin từ ảnh"
                                icon={XSquare}
                                iconSize={42}
                                message="Vui lòng kiểm tra lại ảnh và thử lại."
                                detail={
                                    <ul className={styles.errorHints}>
                                        <li>Đảm bảo ảnh rõ nét, đủ sáng</li>
                                        <li>Không bị che khuất hoặc mờ</li>
                                        <li>Đúng mặt trước / mặt sau CCCD</li>
                                    </ul>
                                }

                                badge={`Còn ${retriesLeft} lần thử`}
                                buttons={
                                    <div className={styles.errorButtons}>
                                        <Button
                                            label="Thử lại"
                                            color="orange"
                                            icon={ArrowsClockwise} iconSize={24}
                                            variant="outline"
                                            labelSize={15}
                                            onClick={handleRetry} />
                                        <Button
                                            label="Tải ảnh khác"
                                            icon={UploadSimple} iconSize={24}
                                            color="orange"
                                            variant="outline"
                                            labelSize={15}
                                            onClick={handleReplaceFiles} />
                                    </div>
                                }
                            />
                        )}

                        {/* Error — hết lượt */}
                        {extractionState === 'error_exhausted' && (
                            <Banner
                                color="orange" variant="solid"
                                title="Đã vượt quá số lần thử cho phép"
                                icon={XSquare}
                                iconSize={42}
                                message={
                                    <>
                                        Bạn có thể thử lại sau 30 phút.<br />
                                        Nếu gặp sự cố, vui lòng liên hệ BTC để được hỗ trợ.
                                    </>
                                }
                                badge={countdown > 0 ? formatCountdown(countdown) : 'Hết giờ chờ'}
                                buttons={
                                    <Button
                                        label="Liên hệ BTC"
                                        color="orange" variant="outline"
                                        // icon={Phone} iconPosition="left" iconSize={18}
                                        labelSize={15}
                                        onClick={() => { /* TODO: mở contact modal */ }}
                                    />
                                }
                            />
                        )}

                        {/* Success — form có thể chỉnh sửa */}
                        {extractionState === 'success' && (
                            <>
                                <Banner
                                    icon={CheckCircle} iconSize={42}
                                    color="green" variant="solid"
                                    title="Trích xuất thông tin thành công!"
                                    message="Vui lòng kiểm tra và chỉnh sửa nếu cần trước khi tiếp tục."
                                />

                                <div className={styles.extractedForm}>

                                    {/* Họ và tên | Số CCCD */}
                                    <FormInput
                                        label="Họ và tên" required
                                        value={formData.fullName}
                                        onChange={e => setField('fullName', e.target.value)}
                                    />
                                    <FormInput
                                        label="Số CCCD" required
                                        value={formData.cmnd}
                                        onChange={e => setField('cmnd', e.target.value)}
                                    />

                                    {/* Ngày sinh | Giới tính */}
                                    <DateTimePicker
                                        label="Ngày sinh" required
                                        showTime={false}
                                        yearsPast={100}
                                        yearsFuture={0}
                                        maxDate={new Date()}
                                        value={formData.dateOfBirth}
                                        onChange={date => setField('dateOfBirth', date)}
                                        placeholder="Chọn ngày sinh"
                                    />
                                    <Dropdown
                                        label="Giới tính" required
                                        options={GENDER_OPTIONS}
                                        value={formData.gender}
                                        onChange={val => setField('gender', val)}
                                        placeholder="Chọn giới tính"
                                    />

                                    {/* Quê quán (full width) */}
                                    <div className={styles.fullWidth}>
                                        <FormInput
                                            label="Quê quán" required
                                            value={formData.hometown}
                                            onChange={e => setField('hometown', e.target.value)}
                                        />
                                    </div>

                                    {/* Địa chỉ thường trú (full width) */}
                                    <div className={styles.fullWidth}>
                                        <FormInput
                                            label="Địa chỉ thường trú" required
                                            value={formData.thuongtru}
                                            onChange={e => setField('thuongtru', e.target.value)}
                                        />
                                    </div>

                                </div>

                                {/* Checkbox xác nhận */}
                                <label className={styles.confirmRow}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={confirmed}
                                        onChange={e => setConfirmed(e.target.checked)}
                                    />
                                    <span className={styles.confirmLabel}>
                                        Tôi xác nhận thông tin trên là chính xác
                                    </span>
                                </label>
                            </>
                        )}
                    </section>
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
                        onClick={onNext}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step1CCCD
