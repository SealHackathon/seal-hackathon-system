import { CheckCircle } from '@phosphor-icons/react';
import Button from '../shared/Button';
import styles from './ProfilePendingModal.module.css';

export default function ProfilePendingModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.iconWrapper}>
                    <CheckCircle size={40} weight="fill" />
                </div>
                <h2 className={styles.title}>Hoàn thiện hồ sơ thành công!</h2>
                <p className={styles.description}>
                    Bạn đã gửi hồ sơ cá nhân thành công. Hãy chờ Ban tổ chức (BTC) duyệt hồ sơ của bạn nhé. 
                    <br /><br />
                    Trong thời gian này, bạn có thể xem các thông tin về sự kiện và cuộc thi, nhưng chưa thể tham gia thi hoặc tạo nhóm. Khi nào hồ sơ được duyệt, bạn sẽ nhận được thông báo qua email!
                </p>
                <div className={styles.actions}>
                    <Button 
                        label="Đã hiểu" 
                        variant="primary" 
                        fullWidth 
                        onClick={onClose} 
                    />
                </div>
            </div>
        </div>
    );
}
