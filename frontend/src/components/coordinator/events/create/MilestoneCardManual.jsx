import { X, ArrowSquareOut } from '@phosphor-icons/react'
import DateTimeRangePicker from '../../../../components/shared/DateTimeRangePicker'
import FormInput from '../../../../components/shared/FormInput'
import styles from './MilestoneCardManual.module.css'

function MilestoneCardManual({ ms, onChange, onDelete }) {
    const hasDate = !!ms.date
    return (
        <div className={[styles.card, !hasDate && styles.cardNoDate].filter(Boolean).join(' ')}>
            <div className={styles.header}>
                {!hasDate && <span className={styles.noDateBadge}>Chưa có ngày</span>}
                <button type="button" className={styles.deleteBtn} onClick={onDelete}>
                    <X size={18} weight="bold" />
                </button>
            </div>
            <FormInput
                label="Tên mốc"
                required
                type="text"
                labelColorVariant='dark'
                className={styles.titleInput}
                labelVariant='small'
                placeholder="Workshop Online..."
                value={ms.title}
                onChange={e => onChange({ ...ms, title: e.target.value })}
            />

            <DateTimeRangePicker
                label="Thời gian"
                required
                startValue={ms.date}
                endValue={ms.endDate}
                onStartChange={date => onChange({ ...ms, date })}
                onEndChange={endDate => onChange({ ...ms, endDate })}
                endOptional
            />
            
            <FormInput
                label="Mô tả ngắn"
                labelVariant='small'
                labelColorVariant='dark'
                className={styles.descInput}
                placeholder="Định hướng chủ đề & giới thiệu công cụ...."
                value={ms.description}
                onChange={e => onChange({ ...ms, description: e.target.value })}
            />
            <FormInput
                label="Đường dẫn"
                labelVariant='small'
                labelColorVariant='dark'
                type="url"
                className={styles.linkInput}
                iconLeft={ArrowSquareOut}
                placeholder="Link tham gia — Zoom, Meet, YouTube Live..."
                value={ms.link}
                onChange={e => onChange({ ...ms, link: e.target.value })}
            />
        </div>
    )
}

export default MilestoneCardManual
