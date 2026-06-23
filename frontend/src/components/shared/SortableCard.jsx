import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical, Trash } from '@phosphor-icons/react'
import styles from './SortableCard.module.css'

/**
 * Card có thể kéo thả để sắp xếp lại.
 *
 * @param {string|number} id        — ID duy nhất (dùng cho dnd-kit)
 * @param {ReactNode}     children  — Nội dung bên trong card
 * @param {Function}      onDelete  — Callback khi ấn xoá
 * @param {boolean}       [draggable=true] — Có cho kéo không
 * @param {boolean}       [showDelete=true]
 * @param {ReactNode}     [avatar]    — Icon/avatar hiển thị trước content (optional)
 * @param {string}        [avatarBg]  — Background color cho avatar circle (optional)
 */

const AVATAR_BG_MAP = {
    orange: styles.avatarOrange,
    blue: styles.avatarBlue,
    green: styles.avatarGreen,
}


function SortableCard({ id, children, onDelete, draggable = true, showDelete = true, avatar, avatarBg }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !draggable })

    const cardStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={cardStyle}
            className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
        >
            {/* Drag handle */}
            {draggable && (
                <div className={styles.dragHandle} {...attributes} {...listeners}>
                    <DotsSixVertical size={20} />
                </div>
            )}

            {/* Avatar (optional) */}
            {avatar && (
                <div className={`${styles.avatar} ${AVATAR_BG_MAP[avatarBg] ?? ''}`}>
                    {avatar}
                </div>

            )}

            {/* Content */}
            <div className={styles.content}>
                {children}
            </div>

            {/* Delete button */}
            {showDelete && (
                <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={onDelete}
                >
                    <Trash size={20} />
                </button>
            )}
        </div>
    )
}

export default SortableCard
