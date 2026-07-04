import {
    DndContext, closestCenter,
    KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { Star, Plus } from '@phosphor-icons/react'
import SortableCard from '../../../../../components/shared/SortableCard'
import FormInput from '../../../../../components/shared/FormInput'
import FormTextarea from '../../../../../components/shared/FormTextarea'
import RichTextEditor from '../../../../../components/shared/RichTextEditor'
import styles from './Step3Prizes.module.css'

// ── Cấu hình các loại giải ──
const RANK_CONFIGS = [
    { rank: 1, defaultName: 'Giải nhất',      avatarBg: 'orange', iconColor: 'var(--color-primary-orange)' },
    { rank: 2, defaultName: 'Giải nhì',       avatarBg: 'blue',   iconColor: 'var(--color-primary-blue)'  },
    { rank: 3, defaultName: 'Giải ba',        avatarBg: 'green',  iconColor: 'var(--color-primary-green)'   },
    { rank: 4, defaultName: 'Khuyến khích',   avatarBg: 'blue',   iconColor: 'var(--color-secondary-blue)'                  },
]

const RANK_OPTIONS = [
    { value: 1, label: '1 giải (Giải nhất)' },
    { value: 2, label: '2 giải (Giải nhất, nhì)' },
    { value: 3, label: '3 giải (Giải nhất, nhì, ba)' },
    { value: 4, label: '4 giải (có Khuyến khích)' },
]

import PrizeCardContent from '../../../../../components/coordinator/events/create/PrizeCardContent'

// ── Main component ──
function Step3Prizes({ formData, onFormChange, errors = {} }) {
    const rankCount = formData.rankCount ?? 3
    const extendedPrizes = formData.extendedPrizes ?? []

    // Khởi tạo mainPrizes dựa trên rankCount, giữ lại data cũ nếu có
    const existingMain = formData.mainPrizes ?? []
    const mainPrizes = RANK_CONFIGS.slice(0, rankCount).map(cfg => {
        const found = existingMain.find(p => p.rank === cfg.rank)
        return found ?? {
            id: cfg.rank,
            rank: cfg.rank,
            defaultName: cfg.defaultName,
            name: cfg.defaultName,
            quantity: 1,
            cash: '',
            desc: '',
        }
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    function handleRankCountChange(newCount) {
        const count = Number(newCount)
        const existing = formData.mainPrizes ?? []
        const updated = RANK_CONFIGS.slice(0, count).map(cfg => {
            const found = existing.find(p => p.rank === cfg.rank)
            return found ?? {
                id: cfg.rank,
                rank: cfg.rank,
                defaultName: cfg.defaultName,
                name: cfg.defaultName,
                quantity: 1,
                cash: '',
                desc: '',
            }
        })
        onFormChange('rankCount', count)
        onFormChange('mainPrizes', updated)
    }

    function updateMainPrize(rank, updated) {
        const newPrizes = mainPrizes.map(p => p.rank === rank ? { ...updated, rank } : p)
        onFormChange('mainPrizes', newPrizes)
    }

    function handleDragEnd({ active, over }) {
        if (!over || active.id === over.id) return
        const oldIndex = extendedPrizes.findIndex(p => p.id === active.id)
        const newIndex = extendedPrizes.findIndex(p => p.id === over.id)
        onFormChange('extendedPrizes', arrayMove(extendedPrizes, oldIndex, newIndex))
    }

    function addExtendedPrize() {
        onFormChange('extendedPrizes', [
            ...extendedPrizes,
            { id: Date.now(), defaultName: 'Tên giải', name: '', quantity: '', cash: '', desc: '' },
        ])
    }

    function updateExtendedPrize(id, updated) {
        onFormChange('extendedPrizes', extendedPrizes.map(p => p.id === id ? { ...updated, id } : p))
    }

    function deleteExtendedPrize(id) {
        onFormChange('extendedPrizes', extendedPrizes.filter(p => p.id !== id))
    }

    return (
        <div className={styles.wrapper}>

            <h1 className={styles.title}>Quyền lợi &amp; Giải thưởng</h1>

            {/* ── Quyền lợi khi tham gia ── */}
            <section className={styles.section}>
                <p className={styles.sectionTitle}>Quyền lợi khi tham gia</p>
                <p className={styles.sectionHint}>
                    Hiển thị nổi bật trên trang sự kiện. Mô tả những gì thí sinh tham gia sẽ được nhận dù không đoạt giải.
                </p>
                <RichTextEditor
                    value={formData.benefits ?? ''}
                    onChange={val => onFormChange('benefits', val)}
                    placeholder="Chứng chỉ tham gia, Networking với mentor & doanh nghiệp, Cơ hội thực tập..."
                />
            </section>

            {/* ── Giải thưởng chính ── */}
            <section className={styles.section}>
                <p className={styles.sectionTitle}>Giải thưởng chính</p>
                <p className={styles.sectionHint}>
                    Các giải theo thứ hạng tự động hiển thị nổi bật trên trang sự kiện theo thứ tự Nhất, Nhì, Ba, Khuyến khích.
                    Có thể đổi lại tên các giải thưởng theo mong muốn.
                </p>

                {/* Dropdown */}
                <div className={styles.rankRow}>
                    <label className={styles.fieldLabel}>Số giải theo thứ hạng</label>
                    <div className={styles.selectBox}>
                        <select
                            className={styles.select}
                            value={rankCount}
                            onChange={e => handleRankCountChange(e.target.value)}
                        >
                            {RANK_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main prize cards — không drag, không xóa */}
                <div className={styles.prizeList}>
                    {mainPrizes.map(prize => {
                        const cfg = RANK_CONFIGS[prize.rank - 1]
                        return (
                            <SortableCard
                                key={prize.rank}
                                id={`main-${prize.rank}`}
                                draggable={false}
                                showDelete={false}
                                avatar={<Star size={18} weight="fill" color={cfg.iconColor} />}
                                avatarBg={cfg.avatarBg}
                            >
                                <PrizeCardContent
                                    prize={prize}
                                    onChange={updated => updateMainPrize(prize.rank, updated)}
                                    errors={errors}
                                    prefix={`mainPrize-${prize.rank}`}
                                />
                            </SortableCard>
                        )
                    })}
                </div>
            </section>

            {/* ── Giải thưởng mở rộng ── */}
            <section className={styles.section}>
                <p className={styles.sectionTitle}>Giải thưởng mở rộng</p>
                <p className={styles.sectionHint}>Thêm các giải ngoài bảng xếp hạng chính.</p>

                {extendedPrizes.length > 0 && (
                    <div className={styles.dragHint}>
                        <span className={styles.dragHintLabel}>Thứ tự hiển thị</span>
                        <span className={styles.dragHintDesc}>
                            Kéo ⋮⋮ để sắp xếp thứ tự, giải sẽ hiển thị theo đúng thứ tự này trên trang sự kiện.
                        </span>
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={extendedPrizes.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={styles.prizeList}>
                            {extendedPrizes.map(prize => (
                                <SortableCard
                                    key={prize.id}
                                    id={prize.id}
                                    onDelete={() => deleteExtendedPrize(prize.id)}
                                    avatar={<Star size={18} weight="fill" color="var(--color-border-blue)" />}
                                    avatarBg="blue"
                                >
                                    <PrizeCardContent
                                        prize={prize}
                                        onChange={updated => updateExtendedPrize(prize.id, updated)}
                                        errors={errors}
                                        prefix={`extPrize-${prize.id}`}
                                    />
                                </SortableCard>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <button type="button" className={styles.addBtn} onClick={addExtendedPrize}>
                    <Plus size={16} weight="bold" />
                    Thêm giải thưởng
                </button>
            </section>

        </div>
    )
}

export default Step3Prizes
