import { Flag } from '@phosphor-icons/react';
import styles from './EmptyEventState.module.css';

export default function EmptyEventState({ searchQuery, activeFilter }) {
    let message = "Bạn chưa có sự kiện nào trong hệ thống.";
    if (searchQuery) {
        message = `Không có sự kiện nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại.`;
    } else if (activeFilter !== 'all') {
        message = "Không có sự kiện nào phù hợp với bộ lọc hiện tại.";
    }

    return (
        <div className={styles.emptyState}>
            <div className={styles.iconWrapper}>
                <Flag size={28} weight="fill" />
            </div>
            <h3 className={styles.title}>Không tìm thấy sự kiện nào</h3>
            <p className={styles.description}>
                {message}
            </p>
        </div>
    );
}
