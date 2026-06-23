import {
    DndContext, closestCenter,
    KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, X, DotsSixVertical } from "@phosphor-icons/react"
import styles from "./AgendaTable.module.css"

function AgendaRow({ item, onChange, onDelete, isOnly, rowError, index }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : undefined,
    }

    function update(field, val) {
        onChange({ ...item, [field]: val })
    }

    return (
        <div ref={setNodeRef} style={style}
            className={[styles.row, rowError && styles.rowError].filter(Boolean).join(" ")}
        >
            <span className={styles.dragHandle} {...listeners}> {/* {...attributes} */}
                <DotsSixVertical size={16} weight="bold" />
            </span>

            <span className={styles.indexBadge}>{index}</span>

            <input
                type="time" className={styles.timeInput}
                value={item.startTime ?? ""}
                onChange={e => update("startTime", e.target.value)}
            />

            <input
                type="text"
                className={`${styles.textInput} ${styles.nameInput}`}
                placeholder="Tên hoạt động"
                value={item.name ?? ""}
                onChange={e => update("name", e.target.value)}
            />

            <input
                type="text" className={styles.textInput}
                placeholder="Mô tả ngắn (tùy chọn)"
                value={item.desc ?? ""}
                onChange={e => update("desc", e.target.value)}
            />

            <button
                type="button" className={styles.deleteBtn}
                onClick={onDelete}
                style={{ visibility: isOnly ? "hidden" : "visible" }}
            >
                <X size={14} weight="bold" />
            </button>

            {rowError && (
                <div className={styles.errorMsg}>{rowError}</div>
            )}
        </div>
    )
}

function validateAgenda(items) {
    const errors = {}
    items.forEach((item, i) => {
        const prev = items[i - 1]
        if (prev?.startTime && item.startTime && item.startTime <= prev.startTime) {
            errors[item.id] = `Giờ bắt đầu phải sau "${prev.name || "Hoạt động " + i}"`
        }
    })
    return errors
}

function AgendaTable({ items = [], onChange }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const errors = validateAgenda(items)

    function handleDragEnd({ active, over }) {
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        onChange(arrayMove(items, oldIndex, newIndex))
    }

    function addMinutes(timeStr, mins) {
        if (!timeStr) return ''
        const [h, m] = timeStr.split(':').map(Number)
        const total = h * 60 + m + mins
        return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
    }

    function addItem() {
        const last = items[items.length - 1]
        onChange([
            ...items,
            {
                id: Date.now(),
                startTime: addMinutes(last?.startTime, 15),
                name: "",
                desc: "",
            },
        ])
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <span />
                <span />
                <span className={styles.headerCell}>Bắt đầu</span>
                <span className={styles.headerCell}>Tên hoạt động</span>
                <span className={styles.headerCell}>Mô tả</span>
                <span />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className={styles.body}>
                        {items.map((item, index) => (
                            <AgendaRow
                                key={item.id}
                                item={item}
                                index={index + 1}
                                rowError={errors[item.id]}
                                onChange={updated => onChange(items.map(i => i.id === item.id ? updated : i))}
                                onDelete={() => onChange(items.filter(i => i.id !== item.id))}
                                isOnly={items.length === 1}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button type="button" className={styles.addBtn} onClick={addItem}>
                <Plus size={15} weight="bold" />
                Thêm hoạt động
            </button>
        </div>
    )
}

export default AgendaTable
