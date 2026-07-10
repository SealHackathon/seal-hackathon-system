import React from 'react'
import { BookOpen, Check, Calculator, WarningCircle, ChartPieSlice } from '@phosphor-icons/react'
import styles from './ScoringCriteriaModal.module.css'
import ModalShell from '../../../shared/ModalShell'
import Button from '../../../shared/Button'
import Badge from '../../../shared/Badge'
import SegmentedWeightBar from '../../../coordinator/rubrics/SegmentedWeightBar'

const BAR_COLORS = [
    'var(--color-primary-blue)',
    'var(--color-secondary-blue)',
    '#92B4FF',
    '#B8D0FF',
    '#D9E8FF',
    '#E8F1FF'
]

const getSegmentColor = (index, length) => {
    if (length <= 2) return BAR_COLORS[index]
    if (index === 0) return BAR_COLORS[0]
    if (index === length - 1) return BAR_COLORS[2]
    return BAR_COLORS[1]
}

// Modal hiển thị tiêu chí chấm điểm cho giám khảo
function ScoringCriteriaModal({ isOpen, onClose, criteria = [] }) {
    if (!isOpen) return null

    // Sắp xếp tiêu chí theo trọng số giảm dần
    const sortedCriteria = [...criteria].sort((a, b) => (b.weight || 0) - (a.weight || 0))

    const footer = (
        <div className={styles.footerContainer}>
            <Button 
                label="Đã hiểu, bắt đầu chấm" 
                icon={Check} 
                onClick={onClose} 
            />
        </div>
    )

    return (
        <ModalShell 
            onClose={onClose} 
            title="Tiêu chí chấm điểm" 
            subtitle={
                <span>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Bộ tiêu chí chấm điểm Vòng bán kết.</strong>
                    <span>Áp dụng cho tất cả đội thi ở mọi hạng mục trong vòng này, do Ban tổ chức SEAL Hackathon Summer 2026 quy định.</span>
                </span>
            }
            icon={<BookOpen weight="fill" size={24} />} 
            size="xl"
            showBottomOverlay={true}
            footer={footer}
        >
            <div className={styles.container}>

                {/* Wrapper chứa 3 khối thông tin chung */}
                <div className={styles.topSection}>
                    {/* Hàng 1: Thang điểm & Cách tính tổng điểm nằm ngang */}
                    <div className={styles.topRow}>
                        {/* Thang điểm mỗi tiêu chí */}
                        <div className={styles.scaleBanner}>
                            <div className={styles.scaleNumber}>0–10</div>
                            <div className={styles.scaleText}>
                                <strong>Thang điểm.</strong> Trọng số % quyết định mức đóng góp.
                            </div>
                        </div>

                        {/* Cách tính tổng điểm */}
                        <div className={styles.calcBox}>
                            <div className={styles.calcHeader}>
                                <Calculator size={24} weight="fill" color="var(--color-border-blue)" />
                                <strong className={styles.calcTitle}>Cách tính</strong>
                            </div>
                            <div className={styles.formulaRow}>
                                <Badge label="Điểm" variant="blueWhiteBg" dot={false} size="md" />
                                <span className={styles.multiplyIcon}>×</span>
                                <Badge label="Trọng số" variant="blueWhiteBg" dot={false} size="md" />
                                <span className={styles.equalsIcon}>=</span>
                                <Badge label="Tổng" variant="blue" dot={false} size="md" />
                            </div>
                        </div>
                    </div>

                    {/* Hàng 2: Chênh lệch điểm số xếp ngang gọn gàng (Giống Thang điểm nhưng màu cam) */}
                    <div className={styles.warningBox}>
                        <div className={styles.warningNumber}>15%</div>
                        <div className={styles.warningText}>
                            <strong>Chênh lệch điểm số.</strong> Vượt ngưỡng & cần thảo luận lại, có thể chỉnh sửa điểm.
                        </div>
                    </div>
                </div>

                {/* Hàng 3: Tiêu đề Trọng số & Thanh biểu đồ */}
                <div className={styles.weightSection}>
                    <div className={styles.weightTitleRow}>
                        <ChartPieSlice size={20} weight="fill" color="var(--color-border-blue)" />
                        <h4 className={styles.weightTitle}>Trọng số</h4>
                    </div>
                    <div className={styles.weightBar}>
                        <SegmentedWeightBar criteria={sortedCriteria} size="large" />
                    </div>
                </div>
                
                {/* Hàng 4: Danh sách các tiêu chí xếp dọc */}
                <div className={styles.listContainer}>
                    <div className={`${styles.criteriaList} scrollbar`}>
                        {sortedCriteria.map((c, i) => (
                            <div className={styles.criteriaBox} key={c.id || i}>
                                <div className={styles.numberLeft}>{String(i + 1).padStart(2, '0')}</div>
                                
                                <div className={styles.textGroup}>
                                    <h4 className={styles.criteriaName}>{c.name || 'Tiêu chí'}</h4>
                                    <p className={styles.criteriaDesc}>
                                        {c.description || 'Không có mô tả chi tiết.'}
                                    </p>
                                </div>

                                <div className={styles.percentBadge}>
                                    <span 
                                        className={styles.colorIndicator}
                                        style={{ backgroundColor: getSegmentColor(i, sortedCriteria.length) }}
                                    />
                                    <span>{c.weight || 0}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </ModalShell>
    )
}

export default ScoringCriteriaModal
