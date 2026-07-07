import Tooltip from '../../shared/Tooltip'
import styles from './SegmentedWeightBar.module.css'

const BAR_COLORS = [
    'var(--color-primary-blue)',
    'var(--color-secondary-blue)',
    '#92B4FF',
    '#B8D0FF',
    '#D9E8FF',
    '#E8F1FF'
];

function SegmentedWeightBar({ criteria = [], size = 'large' }) {
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

    const getSegmentColor = (index, length) => {
        if (length <= 2) return BAR_COLORS[index];
        if (index === 0) return BAR_COLORS[0];
        if (index === length - 1) return BAR_COLORS[2];
        return BAR_COLORS[1];
    };

    return (
        <div className={`${styles.segmentedBar} ${size === 'large' ? styles.large : styles.small}`}>
            {criteria.map((c, i) => (
                <div
                    key={c.id || i}
                    style={{
                        width: `${Math.min(c.weight || 0, 100)}%`,
                        backgroundColor: getSegmentColor(i, criteria.length)
                    }}
                    className={styles.segment}
                >
                    <Tooltip
                        position="top"
                        bgColor="white"
                        textColor="blue"
                        content={
                            <div className={styles.tooltipContent}>
                                <div className={styles.tooltipHeader}>
                                    <span className={styles.tooltipName}>{c.name || 'Tiêu chí'}</span>
                                    <span className={styles.tooltipWeight}>{c.weight || 0}%</span>
                                </div>
                                {c.description && (
                                    <p className={styles.tooltipDesc}>{c.description}</p>
                                )}
                            </div>
                        }
                    >
                        <div className={styles.segmentHitbox}></div>
                    </Tooltip>
                </div>
            ))}
            {totalWeight < 100 && (
                <div
                    style={{ width: `${100 - totalWeight}%` }}
                    className={`${styles.segment} ${styles.segmentEmpty}`}
                >
                    <Tooltip
                        position="top"
                        bgColor="white"
                        textColor="orange"
                        content={
                            <div className={styles.tooltipContent}>
                                <div className={styles.tooltipHeader}>
                                    <span className={styles.tooltipName}>Còn thiếu</span>
                                    <span className={styles.tooltipWeight}>{100 - totalWeight}%</span>
                                </div>
                                <p className={styles.tooltipDesc}>
                                    Tổng trọng số chưa đạt 100%. Vui lòng phân bổ thêm.
                                </p>
                            </div>
                        }
                    >
                        <div className={styles.segmentHitbox}>
                            <div className={styles.emptyPattern}></div>
                        </div>
                    </Tooltip>
                </div>
            )}
        </div>
    );
}

export default SegmentedWeightBar;
