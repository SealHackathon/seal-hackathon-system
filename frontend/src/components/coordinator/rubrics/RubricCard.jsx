import { SquaresFour, FileText, Clock, PencilSimple, Copy, Trash } from '@phosphor-icons/react';
import Tooltip from '../../shared/Tooltip';
import StatusBadge from '../StatusBadge';
import SegmentedWeightBar from './SegmentedWeightBar';
import styles from './RubricCard.module.css';

const getSegmentColor = (index, total) => {
    // calculate opacity from 1.0 down to 0.2 based on index
    const minOpacity = 0.2;
    const maxOpacity = 1;
    const step = total > 1 ? (maxOpacity - minOpacity) / (total - 1) : 0;
    const opacity = maxOpacity - (step * index);
    return `rgba(8, 76, 221, ${opacity})`;
};

export default function RubricCard({ rubric, onDelete, onEdit, onDuplicate }) {
    const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    const isUsed = rubric.usageCount > 0;

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <div className={styles.titleRow}>
                        <h3 className={styles.title}>{rubric.name}</h3>
                        {rubric.isDraft && <StatusBadge status="draft" label="Bản nháp" size="sm" />}
                    </div>
                    <div className={styles.meta}>
                        <span className={`${styles.tag} ${styles.tagBlue}`}>
                            <SquaresFour size={14} weight="fill" />
                            {rubric.criteria.length} Tiêu chí
                        </span>
                        <span className={`${styles.tag} ${isUsed ? styles.tagOrange : styles.tagGrey}`}>
                            <FileText size={14} weight="fill" />
                            {isUsed ? `Sử dụng trong ${rubric.usageCount} vòng` : 'Chưa sử dụng'}
                        </span>
                        <span className={styles.date}>
                            <Clock size={14} />
                            Cập nhật: {formatDate(rubric.lastModified)}
                        </span>
                    </div>
                    <p className={styles.description}>{rubric.description}</p>
                </div>

                <div className={styles.actions}>
                    <Tooltip content="Chỉnh sửa" bgColor="blue" textColor="white" position="top">
                        <button className={styles.actionBtn} onClick={() => onEdit && onEdit(rubric.id)}>
                            <PencilSimple size={20} weight='fill' />
                        </button>
                    </Tooltip>

                    <div className={styles.divider}></div>

                    <Tooltip content="Nhân bản" bgColor="blue" textColor="white" position="top">
                        <button className={styles.actionBtn} onClick={() => onDuplicate && onDuplicate(rubric.id)}>
                            <Copy size={20} weight='fill' />
                        </button>
                    </Tooltip>

                    <div className={styles.divider}></div>

                    <Tooltip content={isUsed ? "Đang được sử dụng" : "Xóa"} bgColor={isUsed ? "white" : "orange"} textColor={isUsed ? "blue" : "white"} position="top">
                        <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => !isUsed && onDelete(rubric.id)}
                            disabled={isUsed}
                        >
                            <Trash size={20} weight='fill' />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className={styles.weightSection}>
                <div className={styles.weightHeader}>
                    <span className={styles.weightTitle}>Phân bổ trọng số</span>
                </div>

                <SegmentedWeightBar criteria={rubric.criteria} size="large" />

                <div className={styles.legend}>
                    {rubric.criteria.map((c, i) => (
                        <div key={i} className={styles.legendItem}>
                            <div
                                className={styles.legendDot}
                                style={{ backgroundColor: getSegmentColor(i, rubric.criteria.length) }}
                            ></div>
                            <span className={styles.legendLabel}>
                                {c.name} <span className={styles.legendWeight}>({c.weight}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
