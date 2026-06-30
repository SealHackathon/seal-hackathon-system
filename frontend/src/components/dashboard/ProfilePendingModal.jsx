import { useEffect, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import Button from '../shared/Button';
import styles from './ProfilePendingModal.module.css';
import { useAuth } from '../../AuthContext';

export default function ProfilePendingModal() {
    const { userStatus } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if status is PROFILE_PENDING
        if (userStatus === 'PROFILE_PENDING') {
            // Check session storage so it only shows once per session
            const hasSeen = sessionStorage.getItem('hasSeenProfilePendingModal');
            if (!hasSeen) {
                setIsOpen(true);
            }
        }
    }, [userStatus]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenProfilePendingModal', 'true');
    };

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
                        onClick={handleClose} 
                    />
                </div>
            </div>
        </div>
    );
}
