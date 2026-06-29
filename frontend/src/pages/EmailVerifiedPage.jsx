import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, WarningCircle } from '@phosphor-icons/react';
import Button from '../components/shared/Button';
import styles from './EmailVerifiedPage.module.css';

export default function EmailVerifiedPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Default to SUCCESS if null, just so you can easily preview it without passing params
    const status = searchParams.get('status') || 'SUCCESS';

    let content = {
        icon: <WarningCircle size={48} weight="fill" />,
        iconClass: 'error',
        title: 'Có lỗi xảy ra',
        description: 'Trạng thái xác nhận không xác định. Vui lòng thử lại.'
    };

    if (status === 'SUCCESS') {
        content = {
            icon: <CheckCircle size={48} weight="fill" />,
            iconClass: 'success',
            title: 'Xác nhận thành công!',
            description: 'Tài khoản của bạn đã được xác nhận thành công. Bây giờ bạn có thể đăng nhập để hoàn thiện hồ sơ cá nhân.'
        };
    } else if (status === 'EXPIRED') {
        content = {
            icon: <WarningCircle size={48} weight="fill" />,
            iconClass: 'error',
            title: 'Link đã hết hạn',
            description: 'Đường dẫn xác nhận này đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email xác nhận.'
        };
    } else if (status === 'INVALID') {
        content = {
            icon: <XCircle size={48} weight="fill" />,
            iconClass: 'error',
            title: 'Token không hợp lệ',
            description: 'Mã xác nhận không đúng hoặc tài khoản không tồn tại. Vui lòng kiểm tra lại.'
        };
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={`${styles.iconWrapper} ${styles[content.iconClass]}`}>
                    {content.icon}
                </div>
                
                <h1 className={styles.title}>{content.title}</h1>
                <p className={styles.description}>{content.description}</p>
                
                <div className={styles.buttonWrapper}>
                    <Button 
                        label="Quay lại trang đăng nhập" 
                        variant="primary" 
                        fullWidth 
                        onClick={() => navigate('/login')}
                    />
                </div>
            </div>
        </div>
    );
}
