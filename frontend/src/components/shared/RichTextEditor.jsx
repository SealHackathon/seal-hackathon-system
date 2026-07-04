import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
    TextB, TextItalic, TextStrikethrough, TextUnderline,
    ListBullets, ListNumbers, TextH, Link as LinkIcon,
    Table as TableIcon
} from '@phosphor-icons/react'

import Dropdown from './Dropdown'

import { useState, useEffect } from 'react'
import styles from './RichTextEditor.module.css'

/**
 * @param {string}   value        — Nội dung HTML hiện tại
 * @param {Function} onChange     — Callback(html: string) khi nội dung thay đổi
 * @param {string}   [placeholder]
 * @param {number}   [maxLength]
 */
function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung...', maxLength }) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')


    const HEADING_OPTIONS = [
        { value: '0', label: 'Văn bản' },
        { value: '1', label: 'Heading 1' },
        { value: '2', label: 'Heading 2' },
        { value: '3', label: 'Heading 3' },
    ]


    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
            Underline,
            Link.configure({ openOnClick: false }),
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
        ],
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

    return (
        <div className={styles.wrapper}>

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
                    className={styles.toolBtn}
                    onClick={handleInsertTable}
                ><TableIcon size={20} /></button>

            </div>

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
                <p className={`${styles.charCount} ${charCount > maxLength ? styles.charCountOver : ''}`}>
                    {charCount}/{maxLength} kí tự
                </p>
            )}

        </div>
    )
}

export default RichTextEditor