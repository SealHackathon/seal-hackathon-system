import { FileText, Plus } from '@phosphor-icons/react';
import styles from './EmptyRubricState.module.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';

export default function EmptyRubricState({ searchQuery }) {
    const navigate = useNavigate();

    return (
        <div className={styles.emptyState}>
            <div className={styles.iconWrapper}>
                <FileText size={28} weight="fill" />
            </div>
            <h3 className={styles.title}>Không tìm thấy Rubric nào</h3>
            <p className={styles.description}>
                {searchQuery
                    ? `Không có rubric nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại.`
                    : "Bạn chưa có bộ tiêu chí chấm điểm nào. Hãy tạo rubric đầu tiên để thiết lập đánh giá cho sự kiện."}
            </p>
            {/* {!searchQuery && (
                <Button 
                    label="Tạo Rubric Mới"
                    icon={Plus}
                    onClick={() => navigate('/admin/coordinator/rubrics/create')}
                />
            )} */}
        </div>
    );
}
