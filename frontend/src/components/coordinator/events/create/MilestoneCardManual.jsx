import { Trash, ArrowSquareOut } from '@phosphor-icons/react'
import DateTimeRangePicker from '../../../../components/shared/DateTimeRangePicker'
import FormInput from '../../../../components/shared/FormInput'
import styles from './MilestoneCardManual.module.css'

function MilestoneCardManual({ ms, onChange, onDelete }) {
    const hasDate = !!ms.date

    const timeError = (() => {
        if (!ms.date || !ms.endDate) return null
        if (ms.endDate <= ms.date) {
            return 'Thời gian kết thúc phải sau thời gian bắt đầu'
        }
        return null
    })()

    return (
        <div className={[styles.card, !hasDate && styles.cardNoDate].filter(Boolean).join(' ')}>
            <div className={styles.topRow}>
                <div className={styles.titleWrapper}>
                    <FormInput
                        label={
                                <span>Tên mốc</span>
                        }
                        required
                        type="text"
                        labelColorVariant='dark'
                        className={styles.titleInput}
                        labelVariant='small'
                        placeholder="Workshop Online..."
                        value={ms.title}
                        onChange={e => onChange({ ...ms, title: e.target.value })}
                    />
                    
                </div>
                <button type="button" className={styles.deleteBtn} onClick={onDelete} title="Xóa mốc">
                    <Trash size={20} weight="fill" />
                </button>
            </div>

            <div className={styles.gridRow}>
                <DateTimeRangePicker
                    label="Thời gian"
                    required
                    startValue={ms.date}
                    endValue={ms.endDate}
                    onStartChange={date => onChange({ ...ms, date })}
                    onEndChange={endDate => onChange({ ...ms, endDate })}
                    endOptional
                    error={timeError}
                />
                <FormInput
                    label="Đường dẫn"
                    labelVariant='small'
                    labelColorVariant='dark'
                    type="url"
                    className={styles.linkInput}
                    iconLeft={ArrowSquareOut}
                    iconSize={20}
                    iconWeight='bold'
                    placeholder="Link tham gia — Zoom, Meet, YouTube Live..."
                    value={ms.link}
                    onChange={e => onChange({ ...ms, link: e.target.value })}
                />
            </div>



            <FormInput
                label="Mô tả ngắn"
                labelVariant='small'
                labelColorVariant='dark'
                className={styles.descInput}
                placeholder="Định hướng chủ đề & giới thiệu công cụ...."
                value={ms.description}
                onChange={e => onChange({ ...ms, description: e.target.value })}
            />

        </div>
    )
}

export default MilestoneCardManual
