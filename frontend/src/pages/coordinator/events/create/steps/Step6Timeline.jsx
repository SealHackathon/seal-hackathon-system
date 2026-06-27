import { useState, useMemo, useRef, useEffect } from 'react'
import SectionHeader from '../../../../../components/shared/SectionHeader'
import Banner from '../../../../../components/shared/Banner'
import TimelineVertical from '../../../../../components/shared/TimelineVertical'
import MilestoneCardAuto from '../../../../../components/coordinator/events/create/MilestoneCardAuto'
import MilestoneCardManual from '../../../../../components/coordinator/events/create/MilestoneCardManual'
import { Plus, CalendarBlank, Info } from '@phosphor-icons/react'
import styles from './Step6Timeline.module.css'

// ── Serialize / Deserialize
// Lưu trong formData dưới dạng { ...ms, date: ISO string | null }
// Đọc lên thì parse lại thành Date
function serialize(ms) {
    return { ...ms, date: ms.date?.toISOString() ?? null, endDate: ms.endDate?.toISOString() ?? null }
}
function deserialize(ms) {
    return { ...ms, date: ms.date ? new Date(ms.date) : null, endDate: ms.endDate ? new Date(ms.endDate) : null }
}

function sortMs(list) {
    return [...list].sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return a.date - b.date
    })
}

function createManual() {
    return { id: `manual-${Date.now()}`, type: 'manual', title: '', date: null, endDate: null, description: '', link: '' }
}

function getAutoMilestones(formData) {
    const ms = []
    if (formData?.openDate) ms.push({
        id: 'auto-open', type: 'auto', source: 'Bước 1',
        title: 'Mở cổng đăng ký',
        date: new Date(formData.openDate), endDate: null, meta: {}
    })
    if (formData?.closeDate) ms.push({
        id: 'auto-close', type: 'auto', source: 'Bước 1',
        title: 'Đóng đăng ký',
        date: new Date(formData.closeDate), endDate: null, meta: {}
    })
    formData?.rounds?.forEach(r => {
        if (!r.startDate) return
        ms.push({
            id: `auto-round-${r.id}`, type: 'auto', source: 'Bước 4',
            title: r.name,
            date: new Date(r.startDate),
            endDate: r.endDate ? new Date(r.endDate) : null,
            meta: {
                location: r.location?.name ?? null,
                submissionDeadline: r.submissionDeadline ? new Date(r.submissionDeadline) : null,
                meetingLink: r.meetingLink ?? null,
            }
        })
    })
    return ms
}

function Step6Timeline({ formData, onChange }) {
    // Khởi tạo từ formData, deserialize ISO strings → Date
    const [manuals, setManuals] = useState(() =>
        (formData?.manualMilestones ?? []).map(deserialize)
    )

    const autoMs  = useMemo(() => getAutoMilestones(formData), [formData])
    const cardRefs = useRef({})
    const prevOrder = useRef([])

    // Lưu manuals vào formData (serialize Date → ISO string)
    function syncManuals(next) {
        setManuals(next)
        onChange?.({ ...formData, manualMilestones: next.map(serialize) })
    }

    const sorted  = useMemo(() => sortMs([...autoMs, ...manuals]), [autoMs, manuals])
    const dated   = sorted.filter(m => m.date)
    const undated = sorted.filter(m => !m.date)

    // Scroll card về giữa màn hình khi nó đổi vị trí
    useEffect(() => {
        const newOrder = sorted.map(m => m.id)
        const prev = prevOrder.current
        if (prev.length > 0 && prev.length === newOrder.length) {
            const movedId = newOrder.find((id, i) => id !== prev[i])
            if (movedId && cardRefs.current[movedId]) {
                cardRefs.current[movedId].scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
        prevOrder.current = newOrder
    }, [sorted])

    // Preview milestones
    const previewMs = dated.map(m => ({
        ...m,
        location           : m.meta?.location ?? null,
        submissionDeadline : m.meta?.submissionDeadline ?? null,
        link               : m.type === 'manual' ? m.link : (m.meta?.meetingLink ?? null),
    }))

    return (
        <div className={styles.wrapper}>
            <SectionHeader level="h1" title="Dòng thời gian" />

            <Banner
                color="blue" variant="flat"
                icon={Info}
                iconSize={32}
                detail="Mốc đăng ký và vòng thi được tạo tự động từ Bước 1 và 4. Khi nhập ngày cho mốc thủ công, hệ thống tự xếp vào đúng vị trí theo thứ tự thời gian."
            />

            <div className={styles.cols}>

                {/* ── Left ── */}
                <div className={styles.cardList}>

                    {dated.map(m => (
                        <div key={m.id} ref={el => cardRefs.current[m.id] = el}>
                            {m.type === 'auto'
                                ? <MilestoneCardAuto ms={m} />
                                : <MilestoneCardManual
                                    ms={m}
                                    onChange={upd => syncManuals(manuals.map(x => x.id === upd.id ? upd : x))}
                                    onDelete={() => syncManuals(manuals.filter(x => x.id !== m.id))}
                                  />
                            }
                        </div>
                    ))}

                    {undated.length > 0 && (
                        <>
                            <div className={styles.manualHeading}>
                                CHƯA CÓ NGÀY
                                <hr/>    
                            </div>
                            {undated.map(m => (
                                <div key={m.id} ref={el => cardRefs.current[m.id] = el}>
                                    <MilestoneCardManual
                                        ms={m}
                                        onChange={upd => syncManuals(manuals.map(x => x.id === upd.id ? upd : x))}
                                        onDelete={() => syncManuals(manuals.filter(x => x.id !== m.id))}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    <button type="button" className={styles.addBtn}
                        onClick={() => syncManuals([...manuals, createManual()])}
                    >
                        <Plus size={14} weight="bold" /> Thêm mốc thủ công
                    </button>
                </div>

                {/* ── Right: preview ── */}
                <div className={styles.preview}>
                    <div className={styles.previewHeader}>
                       <CalendarBlank weight='fill' color='var(--color-border-blue)'/>  <span className={styles.previewTitle}>Dòng thời gian hiển thị trên trang sự kiện</span>
                    </div>
                    <div className={styles.previewBody}>
                        <TimelineVertical milestones={previewMs} showToday />
                        {undated.length > 0 && (
                            <p className={styles.undatedNote}>{undated.length} mốc chưa có ngày</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Step6Timeline
