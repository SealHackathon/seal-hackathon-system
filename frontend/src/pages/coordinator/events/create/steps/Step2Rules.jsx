import {
    DndContext, closestCenter,
    KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Eye, WarningCircle, ArrowSquareOut, X } from '@phosphor-icons/react'
import SortableCard from '../../../../../components/shared/SortableCard'
import FormTextarea from '../../../../../components/shared/FormTextarea'
import FormInput from '../../../../../components/shared/FormInput'
import RichTextEditor from '../../../../../components/shared/RichTextEditor'
import Banner from '../../../../../components/shared/Banner'
import styles from './Step2Rules.module.css'

function RulesPreviewCard({ notes }) {
    return (
        <div className={styles.previewCard}>

            {/* Header */}
            <div className={styles.previewCardHeader}>
                <div className={styles.titleRow}>
                    <WarningCircle size={22} weight="bold" color="var(--color-primary-blue)" />
                    <strong className={styles.previewTitle}>Lưu ý trước khi đăng ký</strong>
                </div>
                <button type="button" className={styles.previewClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            <div className={styles.previewCardBody}>

                {/* Banner */}
                <div className={styles.banner}>
                    <p>
                        Đây là lưu ý quan trọng để đảm bảo quyền lợi của bạn.<br />
                        Vui lòng <strong>đọc kỹ</strong> và <strong>xác nhận</strong> trước khi qua bước tiếp theo.
                    </p>
                </div>

                {/* Numbered list */}
                {notes.length > 0 ? (
                    <ol className={styles.list}>
                        {notes.map(note => (
                            <li key={note.id}>
                                <p className={styles.ruleTitle}>{note.title}</p>
                                {note.desc && (
                                    <div className={styles.rule}>
                                        <p>{note.desc}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className={styles.previewEmpty}>
                        Chưa có lưu ý nào. Thêm lưu ý ở bên trái để xem trước.
                    </p>
                )}

                {/* Rules link */}
                <p className={styles.rulesLink}>
                    Xem đầy đủ thể lệ và quy định chi tiết tại:{' '}
                    <a href="#" target="_blank" rel="noopener noreferrer" className={styles.rulesAnchor}>
                        Quy định cuộc thi <ArrowSquareOut size={13} />
                    </a>
                </p>

                {/* Checkbox */}
                <label className={styles.agreeRow}>
                    <input type="checkbox" disabled />
                    <span>Tôi đã đọc và đồng ý với các điều kiện tham gia</span>
                </label>

            </div>
        </div>
    )
}

function Step2Rules({ formData, onFormChange }) {
    const notes = formData.notes ?? []

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd({ active, over }) {
        if (!over || active.id === over.id) return
        const oldIndex = notes.findIndex(n => n.id === active.id)
        const newIndex = notes.findIndex(n => n.id === over.id)
        onFormChange('notes', arrayMove(notes, oldIndex, newIndex))
    }

    function addNote() {
        onFormChange('notes', [
            ...notes,
            { id: Date.now(), title: '', desc: '' },
        ])
    }

    function updateNote(id, field, val) {
        const value = val?.target ? val.target.value : val
        onFormChange('notes', notes.map(n =>
            n.id === id ? { ...n, [field]: value } : n
        ))
    }

    function deleteNote(id) {
        onFormChange('notes', notes.filter(n => n.id !== id))
    }

    const previewNotes = notes.filter(n => n.title.trim())

    return (
        <div className={styles.wrapper}>

            <h1 className={styles.title}>Quy định</h1>

            {/* ── Quy định chung — full width ── */}
            <section className={styles.section}>
                <p className={styles.sectionTitle}>
                    Quy định chung
                    <span className={styles.required}> *</span>
                </p>
                <p className={styles.sectionHint}>
                    Áp dụng cho toàn bộ cuộc thi — điều kiện tham gia, ứng xử, sở hữu trí tuệ, xử lý vi phạm...
                </p>
                <RichTextEditor
                    value={formData.generalRules ?? ''}
                    onChange={val => onFormChange('generalRules', val)}
                    placeholder="Mô tả quy định chung của cuộc thi. Ví dụ: điều kiện tham gia, hành vi bị cấm..."
                />
            </section>

            {/* ── 2 cột: Lưu ý (trái) + Preview (phải) ── */}
            <div className={styles.layout}>

                {/* CỘT TRÁI */}
                <div className={styles.colLeft}>
                    <p className={styles.sectionTitle}>Lưu ý trước đăng ký</p>
                    <p className={styles.sectionHint}>
                        Thí sinh phải đọc và xác nhận các lưu ý này trước khi hoàn tất đăng ký.
                    </p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={notes.map(n => n.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className={styles.noteList}>
                                {notes.map(note => (
                                    <SortableCard
                                        key={note.id}
                                        id={note.id}
                                        onDelete={() => deleteNote(note.id)}
                                    >
                                        <FormInput
                                            label="Tiêu đề"
                                            required
                                            placeholder="Thông tin đăng ký không thể thay đổi sau khi nộp"
                                            value={String(note.title ?? '')}
                                            onChange={val => updateNote(note.id, 'title', val)}
                                        />
                                        <FormTextarea
                                            className={styles.textArea}
                                            label="Mô tả"
                                            rows={3}
                                            maxLength={300}
                                            placeholder="Giải thích chi tiết về lưu ý này..."
                                            value={String(note.desc ?? '')}
                                            onChange={e => updateNote(note.id, 'desc', e.target.value)}
                                        />
                                    </SortableCard>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <button type="button" className={styles.addBtn} onClick={addNote}>
                        <Plus size={16} weight="bold" />
                        Thêm lưu ý
                    </button>
                </div>

                {/* CỘT PHẢI — PREVIEW */}
                <div className={styles.colRight}>
                    <Banner
                        color="blue"
                        variant="solid"
                        icon={Eye}
                        iconSize={22}
                        title="Xem trước"
                        message="Đây là giao diện thí sinh sẽ thấy trước khi hoàn tất đăng ký."
                    />

                    <RulesPreviewCard notes={previewNotes} />
                </div>

            </div>
        </div>
    )
}

export default Step2Rules
