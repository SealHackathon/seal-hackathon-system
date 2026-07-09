import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import ImageResize from 'tiptap-extension-resize-image'
import {
    TextB, TextItalic, TextStrikethrough, TextUnderline,
    ListBullets, ListNumbers, TextH, Link as LinkIcon,
    Table as TableIcon, FileArrowUp, Trash, Image as ImageIcon
} from '@phosphor-icons/react'
import Button from './Button'
import Dropdown from './Dropdown'
import mammoth from 'mammoth'
import { marked } from 'marked'

import { useState, useEffect, useMemo, useRef } from 'react'
import styles from './RichTextEditor.module.css'

/**
 * @param {string}   value        — Nội dung HTML hiện tại
 * @param {Function} onChange     — Callback(html: string) khi nội dung thay đổi
 * @param {string}   [placeholder]
 * @param {number}   [maxLength]
 * @param {string}   [status]     — Trạng thái lỗi (vd: 'error')
 * @param {string}   [message]    — Câu thông báo lỗi
 */
function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung...', maxLength, status, message }) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)


    const HEADING_OPTIONS = [
        { value: '0', label: 'Văn bản' },
        { value: '1', label: 'Heading 1' },
        { value: '2', label: 'Heading 2' },
        { value: '3', label: 'Heading 3' },
    ]

    const TABLE_OPTIONS = [
        { value: 'add-row-below', label: 'Thêm dòng dưới' },
        { value: 'add-row-above', label: 'Thêm dòng trên' },
        { value: 'delete-row', label: 'Xóa dòng' },
        { value: 'add-col-right', label: 'Thêm cột phải' },
        { value: 'add-col-left', label: 'Thêm cột trái' },
        { value: 'delete-col', label: 'Xóa cột' },
        { value: 'delete-table', label: 'Xóa bảng' },
    ]

    const extensions = useMemo(() => [
        StarterKit.configure({
            link: { openOnClick: false }
        }),
        Placeholder.configure({ placeholder }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
        ImageResize,
    ], [placeholder])

    const editor = useEditor({
        extensions,
        content: value || '',
        onUpdate({ editor }) {
            onChange?.(editor.getHTML())
        },
    })

    // Sync nội dung nếu giá trị thay đổi (e.g., loaded from API)
    useEffect(() => {
        if (editor && value !== undefined) {
            const currentContent = editor.getHTML()
            // Chỉ cập nhật nếu nội dung khác và không phải là thẻ <p></p>
            if (value !== currentContent && value !== `<p></p>`) {
                editor.commands.setContent(value || '')
            }
        }
    }, [value, editor])

    if (!editor) return null

    const charCount = editor.getText().length

    // ── Gắn link ──
    function handleSetLink() {
        if (!showLinkInput) {
            setShowLinkInput(true)
            setLinkUrl(editor.getAttributes('link').href || '')
            return
        }
        if (linkUrl.trim()) {
            editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
        } else {
            editor.chain().focus().unsetLink().run()
        }
        setShowLinkInput(false)
        setLinkUrl('')
    }

    function handleLinkKeyDown(e) {
        if (e.key === 'Enter') handleSetLink()
        if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') }
    }

    // ── Thêm table 3x3 ──
    function handleInsertTable() {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }

    // ── Thêm ảnh ──
    function handleImageUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return

        // Giới hạn dung lượng file: 5MB
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.')
            e.target.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result
            const img = new window.Image()
            img.src = base64
            img.onload = () => {
                let w = img.width
                if (w > 800) w = 800
                editor.commands.insertContent(`<img src="${base64}" width="${w}">`)
            }
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    // ── Import file ──
    async function handleFileImport(e) {
        const file = e.target.files?.[0]
        if (!file) return

        // Giới hạn dung lượng file: 5MB
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.')
            e.target.value = ''
            return
        }

        const ext = file.name.split('.').pop().toLowerCase()

        try {
            if (ext === 'txt' || ext === 'md') {
                const text = await file.text()
                // Dùng marked cho cả .txt để giữ được cấu trúc list (bullet points) và thụt đầu dòng
                const html = await marked.parse(text)
                editor.commands.setContent(html)
            } else if (ext === 'docx' || ext === 'doc') {
                const arrayBuffer = await file.arrayBuffer()
                const options = {
                    convertImage: mammoth.images.imgElement(function (image) {
                        return image.read("base64").then(function (imageBuffer) {
                            return {
                                src: "data:" + image.contentType + ";base64," + imageBuffer
                            }
                        })
                    })
                }
                const result = await mammoth.convertToHtml({ arrayBuffer }, options)

                // Parse HTML để lấy kích thước gốc của các ảnh bên trong file docx
                const parser = new DOMParser()
                const doc = parser.parseFromString(result.value, 'text/html')
                const images = doc.querySelectorAll('img')

                const loadPromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        const tempImg = new window.Image()
                        tempImg.src = img.src
                        tempImg.onload = () => {
                            let w = tempImg.width
                            if (w > 800) w = 800
                            img.setAttribute('width', w)
                            resolve()
                        }
                        tempImg.onerror = () => resolve()
                    })
                })

                await Promise.all(loadPromises)

                editor.commands.setContent('')
                editor.commands.insertContent(doc.body.innerHTML)
            } else {
                alert('Định dạng file không được hỗ trợ!')
            }
        } catch (error) {
            console.error('Lỗi khi đọc file:', error)
            alert('Có lỗi xảy ra khi đọc file!')
        }

        // Reset input
        e.target.value = ''
    }

    return (
        <div className={`${styles.wrapper} ${status === 'error' ? styles.wrapperError : ''}`}>

            {/* ── Toolbar ── */}
            <div className={styles.toolbar}>

                {/* Heading select */}
                <div className={styles.headingDropdown}>
                    <Dropdown
                        value={
                            editor.isActive('heading', { level: 1 }) ? '1' :
                                editor.isActive('heading', { level: 2 }) ? '2' :
                                    editor.isActive('heading', { level: 3 }) ? '3' : '0'
                        }
                        options={HEADING_OPTIONS}
                        onChange={val => {
                            const level = parseInt(val)
                            if (level === 0) editor.chain().focus().setParagraph().run()
                            else editor.chain().focus().toggleHeading({ level }).run()
                        }}
                    />

                </div>

                <div className={styles.divider} />

                {/* Bold */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('bold') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                ><TextB size={20} weight="bold" /></button>

                {/* Italic */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('italic') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                ><TextItalic size={20} /></button>

                {/* Underline */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('underline') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                ><TextUnderline size={20} /></button>

                {/* Strikethrough */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('strike') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                ><TextStrikethrough size={20} /></button>

                <div className={styles.divider} />

                {/* Bullet list */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('bulletList') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                ><ListBullets size={20} /></button>

                {/* Ordered list */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('orderedList') ? styles.toolBtnActive : ''}`}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                ><ListNumbers size={20} /></button>

                <div className={styles.divider} />

                {/* Link */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('link') ? styles.toolBtnActive : ''}`}
                    onClick={handleSetLink}
                ><LinkIcon size={20} /></button>

                {/* Table */}
                <button type="button"
                    className={`${styles.toolBtn} ${editor.isActive('table') ? styles.toolBtnActive : ''}`}
                    onClick={handleInsertTable}
                ><TableIcon size={20} /></button>

                {/* Image */}
                <button type="button"
                    className={styles.toolBtn}
                    onClick={() => imageInputRef.current?.click()}
                    title="Thêm ảnh"
                ><ImageIcon size={20} /></button>
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif"
                    ref={imageInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />

                <div style={{ flex: 1 }} />

                <input
                    type="file"
                    accept=".txt,.md,.docx,.doc"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileImport}
                />

                <Button
                    label="Import file"
                    variant="outline"
                    color="blue"
                    icon={FileArrowUp}
                    iconSize={18}
                    labelSize={14}
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.importBtn}
                />

            </div>

            {/* ── Sub Toolbar for Table ── */}
            {editor.isActive('table') && (
                <div className={styles.subToolbar}>
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().addRowBefore().run()}>+ Dòng trên</button>
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().addRowAfter().run()}>+ Dòng dưới</button>
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().deleteRow().run()}>- Dòng</button>
                    <div className={styles.divider} />
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Cột trái</button>
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Cột phải</button>
                    <button type="button" className={styles.toolBtnText} onClick={() => editor.chain().focus().deleteColumn().run()}>- Cột</button>
                    <div className={styles.divider} />
                    <button type="button" className={styles.toolBtn} onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng">
                        <Trash size={18} color="var(--color-primary-orange)" />
                    </button>
                </div>
            )}

            {/* ── Link input bar ── */}
            {showLinkInput && (
                <div className={styles.linkBar}>
                    <input
                        className={styles.linkInput}
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={handleLinkKeyDown}
                        autoFocus
                    />
                    <button type="button" className={styles.linkConfirm} onClick={handleSetLink}>
                        Xác nhận
                    </button>
                    <button type="button" className={styles.linkCancel}
                        onClick={() => { setShowLinkInput(false); setLinkUrl('') }}
                    >
                        Huỷ
                    </button>
                </div>
            )}

            {/* ── Editor area ── */}
            <EditorContent editor={editor} className={styles.editorArea} />

            {/* ── Char count ── */}
            {maxLength && (
                <div className={styles.footer}>
                    <span className={`${styles.charCount} ${charCount > maxLength ? styles.charCountOver : ''}`}>
                        {charCount}/{maxLength} kí tự
                    </span>
                </div>
            )}
            {(status === 'error' && message) && (
                <span className={styles.errorMessage}>{message}</span>
            )}
        </div>


    )
}

export default RichTextEditor