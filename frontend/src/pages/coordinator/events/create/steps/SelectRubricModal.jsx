import { useState, useEffect } from 'react'
import ModalShell from '../../../../../components/shared/ModalShell'
import { MagnifyingGlass, CheckCircle } from '@phosphor-icons/react'
import FormInput from '../../../../../components/shared/FormInput'
import Button from '../../../../../components/shared/Button'
import axiosClient from '../../../../../api/axiosClient'
import SegmentedWeightBar from '../../../../../components/coordinator/rubrics/SegmentedWeightBar'
import styles from './SelectRubricModal.module.css'

export default function SelectRubricModal({ onClose, onSelect, selectedRubricId }) {
    const [rubrics, setRubrics] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [tempSelectedId, setTempSelectedId] = useState(selectedRubricId)

    useEffect(() => {
        axiosClient.get('/scoring-template')
            .then(res => {
                const data = res.data?.data || res.data?.payload || res.data || []
                setRubrics(Array.isArray(data) ? data : [])
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const filteredRubrics = rubrics.filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleConfirm = () => {
        const selected = rubrics.find(r => r.id === tempSelectedId)
        if (selected) {
            onSelect(selected)
        }
    }

    return (
        <ModalShell onClose={onClose} size="md">
            <div className={styles.header}>
                <h2 className={styles.title}>Chọn bộ tiêu chí chấm điểm</h2>
                <p className={styles.subtitle}>Chọn một bộ tiêu chí để áp dụng cho vòng thi này.</p>
            </div>

            <div className={styles.searchWrap}>
                <FormInput
                    iconLeft={MagnifyingGlass}
                    placeholder="Tìm kiếm bộ tiêu chí..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {loading ? (
                    <div className={styles.empty}>Đang tải danh sách bộ tiêu chí...</div>
                ) : filteredRubrics.length === 0 ? (
                    <div className={styles.empty}>Không tìm thấy bộ tiêu chí nào.</div>
                ) : (
                    filteredRubrics.map(r => (
                        <div
                            key={r.id}
                            className={`${styles.item} ${r.id === tempSelectedId ? styles.selected : ''}`}
                            onClick={() => setTempSelectedId(r.id)}
                        >
                            <div className={styles.itemInfo}>
                                <div className={styles.itemName}>{r.name}</div>
                                <div className={styles.itemDesc}>{r.description || 'Không có mô tả'}</div>
                                {r.criteria && r.criteria.length > 0 && (
                                    <div className={styles.weightBarWrap}>
                                        <SegmentedWeightBar criteria={r.criteria} size="small" />
                                    </div>
                                )}
                            </div>
                            {r.id === tempSelectedId && (
                                <CheckCircle size={24} weight="fill" color="var(--color-primary-blue)" className={styles.checkIcon} />
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className={styles.footer}>
                <Button label="Hủy" variant="outline" color="grey" onClick={onClose} />
                <Button label="Xác nhận" variant="primary" color="blue" disabled={!tempSelectedId} onClick={handleConfirm} />
            </div>
        </ModalShell>
    )
}
