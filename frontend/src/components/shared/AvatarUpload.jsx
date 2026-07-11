import { useState, useCallback, useEffect, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { CloudArrowUp, User, ArrowCounterClockwise, Minus, Plus } from '@phosphor-icons/react'
import ModalShell from './ModalShell'
import Button from './Button'
import styles from './AvatarUpload.module.css'

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

/**
 * Cắt ảnh theo croppedAreaPixels, trả về Blob (JPEG 92%)
 */
async function getCroppedBlob(imageSrc, croppedAreaPixels) {
    const image = await loadImage(imageSrc)
    const { x, y, width, height } = croppedAreaPixels
    const size = Math.min(width, height)

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, x, y, width, height, 0, 0, size, size)

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

const ACCEPT_MIME = ['image/png', 'image/jpeg', 'image/jpg']
const ACCEPT_EXT = '.png,.jpg,.jpeg'
const MAX_MB = 2
const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.05

// ─────────────────────────────────────────────────────────────
//  AvatarUpload  — controlled component
//
//  Props:
//    label     string             Tiêu đề field (default "Ảnh hồ sơ")
//    value     Blob | null        Blob đã crop (điều khiển từ ngoài)
//    onChange  (blob | null) => void
// ─────────────────────────────────────────────────────────────
function AvatarUpload({ label = 'Ảnh hồ sơ', value, onChange }) {
    const [modalOpen, setModalOpen] = useState(false)

    // Object URL của value (để preview avatar hiện tại)
    const [previewUrl, setPreviewUrl] = useState(null)

    useEffect(() => {
        if (!value) { setPreviewUrl(null); return }
        const url = URL.createObjectURL(value)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [value])

    function openModal() { setModalOpen(true) }
    function closeModal() { setModalOpen(false) }

    function handleCropSave(blob) {
        onChange(blob)
        closeModal()
    }

    function handleRemove() {
        onChange(null)
    }

    return (
        <div className={styles.wrapper}>
            {label && <span className={styles.fieldLabel}>{label}</span>}

            <div className={styles.row}>
                {/* ── Avatar preview ── */}
                <div className={styles.avatarWrapper}>
                    <div className={`${styles.avatarCircle} ${previewUrl ? '' : styles.avatarEmpty}`}>
                        {previewUrl
                            ? <img src={previewUrl} alt="avatar" className={styles.avatarImg} />
                            : <User size={48} weight="fill" className={styles.avatarIcon} />
                        }
                    </div>
                </div>

                {/* ── Buttons + hint ── */}
                <div className={styles.info}>
                    <div className={styles.buttons}>
                        <Button label="Thay đổi" onClick={openModal} />
                        <Button
                            label="Xoá tệp"
                            variant="outline"
                            disabled={!value}
                            onClick={handleRemove}
                        />
                    </div>
                    <p className={styles.hint}>Ảnh vuông, định dạng JPG hoặc PNG, tối đa {MAX_MB}MB.</p>
                </div>
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <ModalShell onClose={closeModal} size="lg">
                    <AvatarModal onSave={handleCropSave} onClose={closeModal} />
                </ModalShell>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  AvatarModal — quản lý 2 bước: chọn file → crop
// ─────────────────────────────────────────────────────────────
function AvatarModal({ onSave, onClose }) {
    const [rawSrc, setRawSrc] = useState(null)  // object URL file gốc
    const [error, setError] = useState('')

    function handleFileSelected(file) {
        if (!file) return

        // Validate
        if (!ACCEPT_MIME.includes(file.type)) {
            setError('Định dạng không hợp lệ. Chỉ chấp nhận PNG, JPG, JPEG.')
            return
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            setError(`File quá lớn. Tối đa ${MAX_MB}MB.`)
            return
        }

        setError('')
        const url = URL.createObjectURL(file)
        setRawSrc(url)
    }

    // Giải phóng object URL khi không dùng nữa
    useEffect(() => {
        return () => { if (rawSrc) URL.revokeObjectURL(rawSrc) }
    }, [rawSrc])

    return rawSrc
        ? (
            <CropStep
                src={rawSrc}
                onSelectOther={() => setRawSrc(null)}
                onSave={onSave}
            />
        )
        : (
            <SelectStep
                error={error}
                onFileSelected={handleFileSelected}
            />
        )
}

// ─────────────────────────────────────────────────────────────
//  SelectStep — dropzone chọn file
// ─────────────────────────────────────────────────────────────
function SelectStep({ error, onFileSelected }) {
    const inputRef = useRef(null)
    const [dragging, setDragging] = useState(false)

    function process(file) { onFileSelected(file) }

    function handleInputChange(e) { process(e.target.files?.[0]) }
    function handleDragOver(e) { e.preventDefault(); setDragging(true) }
    function handleDragLeave() { setDragging(false) }
    function handleDrop(e) { e.preventDefault(); setDragging(false); process(e.dataTransfer.files?.[0]) }

    return (
        <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Chọn ảnh hồ sơ</h2>
            <p className={styles.modalSub}>
                Để đạt chất lượng tốt nhất, hãy tải lên ảnh vuông, tối thiểu 200×200px
            </p>

            <div
                className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''} ${error ? styles.dropzoneError : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudArrowUp size={40} className={styles.dropIcon} />
                <p className={styles.dropMain}>
                    <span className={styles.dropLink}>Ấn để tải lên</span> hoặc kéo thả vào đây
                </p>
                <p className={styles.dropSub}>Hỗ trợ định dạng PNG, JPG, JPEG</p>
                <p className={styles.dropSub}>Kích thước tối đa {MAX_MB} MB</p>
                {error && <p className={styles.dropError}>{error}</p>}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_EXT}
                className={styles.hiddenInput}
                onChange={handleInputChange}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  CropStep — crop tròn với zoom slider
// ─────────────────────────────────────────────────────────────
function CropStep({ src, onSelectOther, onSave }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [saving, setSaving] = useState(false)

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    function handleReset() {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
    }

    async function handleSave() {
        if (!croppedAreaPixels) return
        setSaving(true)
        try {
            const blob = await getCroppedBlob(src, croppedAreaPixels)
            onSave(blob)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Chọn ảnh hồ sơ</h2>

            {/* Cropper area */}
            <div className={styles.cropArea}>
                <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    classes={{
                        containerClassName: styles.reactEasyCrop,
                        cropAreaClassName: styles.reactEasyCropArea,
                    }}
                />
            </div>

            {/* Zoom controls */}
            <div className={styles.zoomRow}>
                <button
                    className={styles.zoomBtn}
                    onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP * 4))}
                    type="button"
                    aria-label="Thu nhỏ"
                >
                    <Minus size={16} weight="bold" />
                </button>

                <input
                    type="range"
                    className={styles.zoomSlider}
                    min={ZOOM_MIN}
                    max={ZOOM_MAX}
                    step={ZOOM_STEP}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                />

                <button
                    className={styles.zoomBtn}
                    onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP * 4))}
                    type="button"
                    aria-label="Phóng to"
                >
                    <Plus size={16} weight="bold" />
                </button>

                <button
                    className={styles.zoomBtn}
                    onClick={handleReset}
                    type="button"
                    aria-label="Đặt lại"
                >
                    <ArrowCounterClockwise size={16} weight="bold" />
                </button>
            </div>

            {/* Footer buttons */}
            <div className={styles.cropFooter}>
                <Button
                    label="Chọn ảnh khác"
                    variant="outline"
                    onClick={onSelectOther}
                />
                <Button
                    label={saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    disabled={saving}
                    onClick={handleSave}
                />
            </div>
        </div>
    )
}

export default AvatarUpload
