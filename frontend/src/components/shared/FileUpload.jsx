import { useRef, useState, useEffect } from 'react'
import { CloudArrowUp, Image, Trash, ArrowClockwise } from '@phosphor-icons/react'
import styles from './FileUpload.module.css'

/**
 * @param {string}   [label]        — Tiêu đề trên dropzone
 * @param {boolean}  [required]
 * @param {string[]} [accept]       — Định dạng cho phép, vd: ['image/png','image/jpeg']
 * @param {number}   [maxSizeMB]    — Giới hạn dung lượng (MB)
 * @param {number}   [aspectRatio]  — Tỉ lệ preview area, vd: 16/9, 1/1
 * @param {File|string} [value]     — Giá trị khởi tạo (File object hoặc Cloudinary URL)
 * @param {Function} [onFileChange] — Callback(file | null) khi file thay đổi
 */
function FileUpload({
    label,
    required,
    accept = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
    maxSizeMB = 5,
    aspectRatio = 16 / 9,
    value = null,
    onFileChange,
    errorMsg,
}) {
    const [file, setFile] = useState(null)   // File object hoặc fake File (từ URL)
    const [preview, setPreview] = useState(null)   // Object URL hoặc Cloudinary URL
    const [error, setError] = useState('')      // Lỗi validate
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef(null)

    // Sync from prop 'value'
    const acceptAttr = accept.join(',')

    // ── Sync with value prop ───────────────────────────
    useEffect(() => {
        if (!value) {
            setFile(null)
            setPreview(null)
            return
        }

        if (value instanceof File) {
            setFile(value)
            const url = URL.createObjectURL(value)
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        } else if (typeof value === 'string') {
            // Cloudinary URL or string URL
            const fakeFile = { name: value.split('/').pop() || 'image_link', size: 0, type: 'image/jpeg', isLink: true }
            setFile(fakeFile)
            setPreview(value)
        }
    }, [value])

    // ── Validate file ──────────────────────────────────
    function validate(f) {
        if (!accept.includes(f.type)) {
            const exts = accept.map(t => t.split('/')[1].toUpperCase()).join(', ')
            return `Định dạng không hợp lệ. Chỉ chấp nhận: ${exts}`
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
            return `File quá lớn. Tối đa ${maxSizeMB}MB`
        }
        return null
    }

    // ── Xử lý file sau khi chọn / thả ─────────────────
    function processFile(f) {
        if (!f) return
        const err = validate(f)
        if (err) {
            setError(err)
            setFile(null)
            setPreview(null)
            onFileChange?.(null)
            return
        }

        setError('')
        // setFile/setPreview sẽ được update thông qua useEffect nếu parent pass 'value'
        // Nhưng nếu component uncontrolled, set luôn ở đây.
        setFile(f)

        if (f.type.startsWith('image/')) {
            const url = URL.createObjectURL(f)
            setPreview(url)
        } else {
            setPreview(null)
        }

        onFileChange?.(f)
    }

    // ── Xoá file ───────────────────────────────────────
    function handleRemove(e) {
        e.stopPropagation()
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
        }
        setFile(null)
        setPreview(null)
        setError('')
        onFileChange?.(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    // ── Retry ──────────────────────────────────────────
    function handleRetry(e) {
        e.stopPropagation()
        handleRemove(e)
        inputRef.current?.click()
    }

    // ── Input change ───────────────────────────────────
    function handleInputChange(e) {
        processFile(e.target.files?.[0])
    }

    // ── Drag & drop ────────────────────────────────────
    function handleDragOver(e) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave() {
        setIsDragging(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setIsDragging(false)
        processFile(e.dataTransfer.files?.[0])
    }

    // ── Tên file rút gọn ──────────────────────────────
    function truncateName(name, max = 30) {
        if (name.length <= max) return name
        const ext = name.split('.').pop()
        return `${name.slice(0, max - ext.length - 4)}...${ext}`
    }

    function formatSize(bytes) {
        if (!bytes) return ''
        return (bytes / (1024 * 1024)).toFixed(1) + ' mb'
    }

    const hasFile = !!file
    const hasError = !!error || !!errorMsg
    const displayError = error || errorMsg
    const isImage = file?.type?.startsWith('image/')

    return (
        <div className={styles.wrapper}>

            {/* ── Label ── */}
            {label && (
                <span className={styles.label}>
                    {label}
                    {required && <span className={styles.asterisk}> *</span>}
                </span>
            )}

            <div className={styles.uploadBox}>
                {/* ── Dropzone / Preview area ── */}
                <div
                    className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${hasError ? styles.dropzoneError : ''}`}
                    style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className={styles.dropzoneInner}>

                        {/* Preview ảnh */}
                        {hasFile && isImage && preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className={styles.previewImg}
                            />
                        )}

                        {/* Hint overlay — luôn hiện khi chưa có file, hoặc hover vào preview */}

                        <div className={`${styles.hint} ${hasFile ? styles.hintOverlay : ''}`}>
                            <CloudArrowUp size={40} className={styles.hintIcon} />
                            <p className={styles.hintMain}>
                                <span className={styles.hintLink}>Ấn để tải lên</span>
                                {' '}Hoặc kéo thả vào đây
                            </p>
                            <p className={styles.hintSub}>
                                Hỗ trợ định dạng {accept.map(t => t.split('/')[1].toUpperCase()).join(', ')}
                            </p>
                            <p className={styles.hintSub}>Kích thước tối đa {maxSizeMB} mb</p>
                        </div>

                    </div>
                </div>

                {/* ── File info bar ── */}
                {hasFile && (
                    <div className={styles.fileBar}>
                        <Image size={32} className={styles.fileIcon} weight='fill' />

                        <div className={styles.fileMeta}>
                            <span className={styles.fileName}>
                                {file.isLink ? (label || 'Ảnh đã tải lên') : truncateName(file.name)}
                            </span>
                            {!file.isLink && (
                                <span className={styles.fileSize}>{formatSize(file.size)}</span>
                            )}
                            <p className={styles.fileSuccess}>Tải lên thành công</p>
                        </div>

                        <button className={styles.actionBtn} onClick={handleRemove} type="button">
                            <Trash size={20} weight='fill' />
                        </button>
                    </div>
                )}

                {/* ── Error bar ── */}
                {hasError && !hasFile && (
                    <div className={styles.fileBar}>
                        <Image size={32} className={styles.fileIcon} weight='fill' />
                        <div className={styles.fileMeta}>
                            <span className={`${styles.fileName} ${styles.fileNameError}`}>Tải lên thất bại</span>
                            <span className={styles.fileError}>{error}</span>
                        </div>
                        <button className={styles.actionBtn} onClick={handleRetry} type="button">
                            <ArrowClockwise size={20} weight='fill' />
                        </button>
                    </div>
                )}

                {/* Hidden input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptAttr}
                    className={styles.hiddenInput}
                    onChange={handleInputChange}
                />
            </div>

        </div>
    )
}

export default FileUpload