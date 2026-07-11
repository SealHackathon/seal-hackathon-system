import { useEffect, useState } from "react"
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
import DateTimePicker from "./DateTimePicker"
import FormInput from "./FormInput"
import styles from "./AgendaTable.module.css"

function AgendaRow({ item, onChange, onDelete, isOnly, rowErrors, index, roundStartDate, highlightRanges }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id })
    const [timeTouched, setTimeTouched] = useState(false)
    const [nameTouched, setNameTouched] = useState(false)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : undefined,
    }

    function update(field, val) {
        onChange({ ...item, [field]: val })
    }

    let displayError = null;
    if (rowErrors) {
        if (rowErrors.time && timeTouched) displayError = rowErrors.time;
        else if (rowErrors.name && nameTouched) displayError = rowErrors.name;
        else if (rowErrors.order) displayError = rowErrors.order;
    }

    return (
        <div ref={setNodeRef} style={style}
            className={[styles.row, displayError && styles.rowError].filter(Boolean).join(" ")}
        >
            <span className={styles.dragHandle} {...listeners}> {/* {...attributes} */}
                <DotsSixVertical size={16} weight="bold" />
            </span>

            <span className={styles.indexBadge}>{index}</span>

            <div className={styles.timeCell} onBlur={(e) => {
                // Chỉ set touched khi focus thực sự rời khỏi component DateTimePicker
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setTimeTouched(true)
                }
            }}>
                <DateTimePicker
                    value={item.startTime}
                    onChange={date => {
                        update("startTime", date)
                        setTimeTouched(true)
                    }}
                    placeholder="Chọn ngày giờ"
                    customDateFormat="dd/MM, HH:mm"
                    highlightRanges={highlightRanges}
                    error={(timeTouched && rowErrors?.time) ? rowErrors.time : (rowErrors?.order ? rowErrors.order : null)}
                />
            </div>

            <div className={styles.inputWrapper}>
                <FormInput
                    placeholder="Tên hoạt động"
                    value={item.name ?? ""}
                    onChange={e => update("name", e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    status={(nameTouched && rowErrors?.name) ? "error" : undefined}
                    message={nameTouched && rowErrors?.name ? rowErrors.name : null}
                />
            </div>

            <div className={styles.inputWrapper}>
                <FormInput
                    placeholder="Mô tả ngắn (tùy chọn)"
                    value={item.desc ?? ""}
                    onChange={e => update("desc", e.target.value)}
                />
            </div>

            <button
                type="button" className={styles.deleteBtn}
                onClick={onDelete}
            >
                <X size={14} weight="bold" />
            </button>
        </div>
    )
}

function validateAgenda(items, roundStartDate, roundEndDate) {
    const errors = {}
    items.forEach((item, i) => {
        const errs = {}
        if (!item.startTime) {
            errs.time = "Vui lòng chọn giờ bắt đầu"
        } else {
            const time = new Date(item.startTime).getTime();
            if (roundStartDate && time < new Date(roundStartDate).getTime()) {
                errs.time = "Phải nằm trong thời gian vòng thi";
            } else if (roundEndDate && time > new Date(roundEndDate).getTime()) {
                errs.time = "Phải nằm trong thời gian vòng thi";
            }
        }
        if (!item.name || item.name.trim() === "") {
            errs.name = "Vui lòng nhập tên hoạt động"
        }
        
        const prev = items[i - 1]
        if (prev?.startTime && item.startTime && item.startTime <= prev.startTime) {
            errs.order = `Giờ bắt đầu phải sau "${prev.name || "Hoạt động " + i}"`
        }

        if (Object.keys(errs).length > 0) {
            errors[item.id] = errs
        }
    })
    return errors
}

function AgendaTable({ items = [], onChange, roundStartDate, roundEndDate, highlightRanges }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const errors = validateAgenda(items, roundStartDate, roundEndDate)

    function handleDragEnd({ active, over }) {
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        onChange(arrayMove(items, oldIndex, newIndex))
    }

    function addMinutes(dateVal, mins) {
        if (!dateVal) return null
        const d = new Date(dateVal)
        if (isNaN(d.getTime())) return null
        return new Date(d.getTime() + mins * 60000)
    }

    function addItem() {
        const last = items[items.length - 1]
        let defaultTime = addMinutes(last?.startTime, 15)
        if (!defaultTime && roundStartDate) {
            defaultTime = new Date(roundStartDate)
        }
        onChange([
            ...items,
            {
                id: Date.now(),
                startTime: defaultTime,
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
                <span className={styles.headerCell}>Ngày giờ bắt đầu <span style={{ color: 'var(--color-primary-orange)' }}>*</span></span>
                <span className={styles.headerCell}>Tên hoạt động <span style={{ color: 'var(--color-primary-orange)' }}>*</span></span>
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
                                rowErrors={errors[item.id]}
                                onChange={updated => onChange(items.map(i => i.id === item.id ? updated : i))}
                                onDelete={() => onChange(items.filter(i => i.id !== item.id))}
                                isOnly={items.length === 1}
                                roundStartDate={roundStartDate}
                                highlightRanges={highlightRanges}
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
