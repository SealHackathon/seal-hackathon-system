import FormInput from '../../../shared/FormInput'
import FormTextarea from '../../../shared/FormTextarea'
import styles from './PrizeCardContent.module.css'

export default function PrizeCardContent({ prize, onChange, disabled = false, errors = {}, prefix = '' }) {
    function update(field, val) {
        onChange({ ...prize, [field]: val })
    }

    return (
        <>
            <FormInput
                label="Tên giải"
                required
                placeholder={prize.defaultName}
                value={String(prize.name ?? '')}
                onChange={e => update('name', e.target.value)}
                disabled={disabled}
                status={errors[`${prefix}-name`] ? 'error' : ''}
                message={errors[`${prefix}-name`]}
            />

            <div className={styles.prizeRow}>
                {/* Trái: số lượng + giá trị */}
                <div className={styles.prizeLeft}>
                    <FormInput
                        label="Số lượng"
                        required
                        type="number"
                        min={1}
                        placeholder="Số đội / cá nhân nhận giải"
                        value={prize.quantity ?? ''}
                        onChange={e => {
                            const val = e.target.value
                            update('quantity', val === '' ? '' : Number(val))
                        }}
                        disabled={disabled}
                        status={errors[`${prefix}-quantity`] ? 'error' : ''}
                        message={errors[`${prefix}-quantity`]}
                    />

                    <FormInput
                        label="Giá trị hiện kim"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={
                            prize.cash !== undefined && prize.cash !== ''
                                ? Number(prize.cash).toLocaleString('vi-VN')
                                : ''
                        }
                        onChange={e => {
                            const raw = e.target.value.replace(/[^0-9]/g, '')
                            update('cash', raw)
                        }}
                        disabled={disabled}
                        suffix="VNĐ"
                    />
                </div>

                {/* Phải: mô tả */}
                <div className={styles.prizeRight}>
                    <FormTextarea
                        className={styles.textArea}
                        label="Mô tả"
                        rows={4}
                        placeholder="Tiền mặt + Cúp + Giấy chứng nhận + Hoa"
                        value={String(prize.desc ?? '')}
                        onChange={e => update('desc', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </>
    )
}
